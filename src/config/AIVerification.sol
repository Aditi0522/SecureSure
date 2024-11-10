// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

interface IInsuranceClaims {
    function verifyClaimByAi(uint256 claimId, uint256 confidenceScore, string memory aiAnalysisHash) external;
}

contract ChainlinkAiOracle is VRFConsumerBaseV2, ConfirmedOwner {
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event ClaimVerificationRequested(uint256 claimId, address insuranceContract);
    event ClaimVerificationProcessed(uint256 claimId, uint256 confidenceScore);
    event SubscriptionIdSet(uint64 subscriptionId);

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    struct VerificationRequest {
        uint256 claimId;
        address insuranceContract;
    }

    mapping(uint256 => RequestStatus) public s_requests; // requestId => requestStatus
    mapping(uint256 => VerificationRequest) public verificationRequests; // requestId => VerificationRequest
    
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 public s_subscriptionId;

    // For Sepolia network
    address constant vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    bytes32 constant s_keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    constructor() 
        VRFConsumerBaseV2(vrfCoordinator)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    }

    // Function to set subscription ID after contract deployment
    function setSubscriptionId(uint64 subscriptionId) external onlyOwner {
        s_subscriptionId = subscriptionId;
        emit SubscriptionIdSet(subscriptionId);
    }

    function requestClaimVerification(uint256 claimId, address insuranceContract) external onlyOwner returns (uint256 requestId) {
        require(s_subscriptionId != 0, "Subscription ID not set");
        
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_requests[requestId] = RequestStatus({
            fulfilled: false,
            exists: true,
            randomWords: new uint256[](0)
        });

        verificationRequests[requestId] = VerificationRequest({
            claimId: claimId,
            insuranceContract: insuranceContract
        });

        emit RequestSent(requestId, numWords);
        emit ClaimVerificationRequested(claimId, insuranceContract);
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;

        // Get the verification request details
        VerificationRequest memory request = verificationRequests[_requestId];
        
        // Calculate confidence score (70-100 range)
        uint256 confidenceScore = (_randomWords[0] % 31) + 70; // This gives us 70-100

        // Create a dummy IPFS hash for analysis
        string memory aiAnalysisHash = string(abi.encodePacked("QmHash", uint2str(_randomWords[0])));

        // Call the insurance contract to verify the claim
        IInsuranceClaims(request.insuranceContract).verifyClaimByAi(
            request.claimId,
            confidenceScore,
            aiAnalysisHash
        );

        emit RequestFulfilled(_requestId, _randomWords);
        emit ClaimVerificationProcessed(request.claimId, confidenceScore);
    }

    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
}