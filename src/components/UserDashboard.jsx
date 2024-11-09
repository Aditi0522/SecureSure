import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../elements/Card";
import axios from "axios";
import { AlertCircle, Upload, CheckCircle } from "lucide-react";
import Navbar from "./Navbar";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Insurance Information
    insuranceType: "", // Medicare, Medicaid, CHAMPUS, etc.
    insuredId: "",
    insuredName: "",
    insuredAddress: "",
    insuredCity: "",
    insuredState: "",
    insuredZip: "",
    insuredPhone: "",
    insuredDob: "",
    insuredSex: "",
    insuredEmployer: "",
    insurancePlan: "",
    otherHealthPlan: false,

    // Patient Information
    patientName: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    patientPhone: "",
    patientDob: "",
    patientSex: "",
    patientStatus: "", // Single, Married, Other
    patientEmployment: "", // Employed, Full-Time Student, Part-Time Student
    patientRelationship: "", // Self, Spouse, Child, Other

    // Condition Information
    isEmploymentRelated: false,
    isAutoAccident: false,
    autoAccidentState: "",
    isOtherAccident: false,

    // Dates and Medical Information
    illnessDate: "",
    similarIllnessDate: "",
    unableToWorkFrom: "",
    unableToWorkTo: "",
    referringPhysician: "",
    referringPhysicianId: "",
    hospitalizationFrom: "",
    hospitalizationTo: "",

    // Diagnosis Information
    diagnosis1: "",
    diagnosis2: "",
    diagnosis3: "",
    diagnosis4: "",

    // Outside Lab Information
    outsideLab: false,
    outsideLabCharges: "",

    // Additional Information
    medicaidResubmissionCode: "",
    medicaidOriginalRef: "",
    priorAuthNumber: "",

    // Billing Information
    acceptAssignment: false,
    totalCharge: "",
    amountPaid: "",
    balanceDue: "",

    // Provider Information
    federalTaxId: "",
    patientAccountNo: "",
    providerName: "",
    providerAddress: "",
    providerCity: "",
    providerState: "",
    providerZip: "",
    providerPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get environment variables based on the build tool being used
    const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || process.env.REACT_APP_PINATA_API_KEY;
    const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || process.env.REACT_APP_PINATA_SECRET_KEY;

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      setNotification({
        type: "error",
        message: "Missing Pinata API credentials. Please check your environment variables.",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          pinataContent: formData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );

      setNotification({
        type: "success",
        message: `Form submitted successfully! IPFS Hash: ${response.data.IpfsHash}`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: "Error submitting form: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, value, type = "text", options = [] }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          name={name}
          checked={value}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );

return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
        <div className="max-w-4xl mx-auto px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-6 h-6" />
                        Claim Form
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Insurance Type Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Insurance Type</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <InputField
                                    label="Type"
                                    name="insuranceType"
                                    value={formData.insuranceType}
                                    type="select"
                                    options={[
                                        { value: "medicare", label: "Medical" },
                                        { value: "medicaid", label: "Accident" },
                                        { value: "champus", label: "Life" },
                                        { value: "champva", label: "Senior " },
                                        { value: "groupHealth", label: "Family Health" },
                                        { value: "other", label: "Other" },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Insured Information Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">
                                Insured Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Insured's ID Number"
                                    name="insuredId"
                                    value={formData.insuredId}
                                />
                                <InputField
                                    label="Insured's Name"
                                    name="insuredName"
                                    value={formData.insuredName}
                                />
                                <InputField
                                    label="Date of Birth"
                                    name="insuredDob"
                                    type="date"
                                    value={formData.insuredDob}
                                />
                                <InputField
                                    label="Sex"
                                    name="insuredSex"
                                    type="select"
                                    value={formData.insuredSex}
                                    options={[
                                        { value: "M", label: "Male" },
                                        { value: "F", label: "Female" },
                                    ]}
                                />
                                <InputField
                                    label="Address"
                                    name="insuredAddress"
                                    value={formData.insuredAddress}
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <InputField
                                        label="City"
                                        name="insuredCity"
                                        value={formData.insuredCity}
                                    />
                                    <InputField
                                        label="State"
                                        name="insuredState"
                                        value={formData.insuredState}
                                    />
                                    <InputField
                                        label="ZIP"
                                        name="insuredZip"
                                        value={formData.insuredZip}
                                    />
                                </div>
                                <InputField
                                    label="Phone"
                                    name="insuredPhone"
                                    value={formData.insuredPhone}
                                />
                                <InputField
                                    label="Employer Name"
                                    name="insuredEmployer"
                                    value={formData.insuredEmployer}
                                />
                                <InputField
                                    label="Other Health Plan?"
                                    name="otherHealthPlan"
                                    type="checkbox"
                                    value={formData.otherHealthPlan}
                                />
                            </div>
                        </div>

                        {/* Patient Information Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">
                                Patient Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Patient's Name"
                                    name="patientName"
                                    value={formData.patientName}
                                />
                                <InputField
                                    label="Date of Birth"
                                    name="patientDob"
                                    type="date"
                                    value={formData.patientDob}
                                />
                                <InputField
                                    label="Sex"
                                    name="patientSex"
                                    type="select"
                                    value={formData.patientSex}
                                    options={[
                                        { value: "M", label: "Male" },
                                        { value: "F", label: "Female" },
                                    ]}
                                />
                                <InputField
                                    label="Patient Status"
                                    name="patientStatus"
                                    type="select"
                                    value={formData.patientStatus}
                                    options={[
                                        { value: "single", label: "Single" },
                                        { value: "married", label: "Married" },
                                        { value: "other", label: "Other" },
                                    ]}
                                />
                                <InputField
                                    label="Employment Status"
                                    name="patientEmployment"
                                    type="select"
                                    value={formData.patientEmployment}
                                    options={[
                                        { value: "employed", label: "Employed" },
                                        { value: "fullTimeStudent", label: "Full-Time Student" },
                                        { value: "partTimeStudent", label: "Part-Time Student" },
                                    ]}
                                />
                                <InputField
                                    label="Relationship to Insured"
                                    name="patientRelationship"
                                    type="select"
                                    value={formData.patientRelationship}
                                    options={[
                                        { value: "self", label: "Self" },
                                        { value: "spouse", label: "Spouse" },
                                        { value: "child", label: "Child" },
                                        { value: "other", label: "Other" },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Condition Information Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">
                                Condition Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Disease Related?"
                                    name="isEmploymentRelated"
                                    type="checkbox"
                                    value={formData.isEmploymentRelated}
                                />
                                <InputField
                                    label="Auto Accident?"
                                    name="isAutoAccident"
                                    type="checkbox"
                                    value={formData.isAutoAccident}
                                />
                                {formData.isAutoAccident && (
                                    <InputField
                                        label="Auto Accident State"
                                        name="autoAccidentState"
                                        value={formData.autoAccidentState}
                                    />
                                )}
                                <InputField
                                    label="Other Accident?"
                                    name="isOtherAccident"
                                    type="checkbox"
                                    value={formData.isOtherAccident}
                                />
                            </div>
                        </div>

                        {/* Diagnosis Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">
                                Diagnosis Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Diagnosis 1"
                                    name="diagnosis1"
                                    value={formData.diagnosis1}
                                />
                                <InputField
                                    label="Diagnosis 2"
                                    name="diagnosis2"
                                    value={formData.diagnosis2}
                                />
                                <InputField
                                    label="Diagnosis 3"
                                    name="diagnosis3"
                                    value={formData.diagnosis3}
                                />
                                <InputField
                                    label="Diagnosis 4"
                                    name="diagnosis4"
                                    value={formData.diagnosis4}
                                />
                            </div>
                        </div>

                        {/* Provider Information Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">
                                Provider Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Federal Tax ID"
                                    name="federalTaxId"
                                    value={formData.federalTaxId}
                                />
                                <InputField
                                    label="Patient Account No"
                                    name="patientAccountNo"
                                    value={formData.patientAccountNo}
                                />
                                <InputField
                                    label="Total Charge"
                                    name="totalCharge"
                                    type="number"
                                    value={formData.totalCharge}
                                />
                                <InputField
                                    label="Amount Paid"
                                    name="amountPaid"
                                    type="number"
                                    value={formData.amountPaid}
                                />
                                <InputField
                                    label="Balance Due"
                                    name="balanceDue"
                                    type="number"
                                    value={formData.balanceDue}
                                />
                                <InputField
                                    label="Provider Name"
                                    name="providerName"
                                    value={formData.providerName}
                                />
                                <InputField
                                    label="Provider Address"
                                    name="providerAddress"
                                    value={formData.providerAddress}
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <InputField
                                        label="City"
                                        name="providerCity"
                                        value={formData.providerCity}
                                    />
                                    <InputField
                                        label="State"
                                        name="providerState"
                                        value={formData.providerState}
                                    />
                                    <InputField
                                        label="ZIP"
                                        name="providerZip"
                                        value={formData.providerZip}
                                    />
                                </div>
                                <InputField
                                    label="Phone"
                                    name="providerPhone"
                                    value={formData.providerPhone}
                                />
                            </div>
                        </div>

                        {/* Submit Button and Notification Section */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                        {notification && (
                            <div
                                className={`mt-4 p-4 rounded-md ${
                                    notification.type === "success"
                                        ? "bg-green-100"
                                        : "bg-red-100"
                                }`}
                            >
                                <div className="flex items-center">
                                    {notification.type === "success" ? (
                                        <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                                    )}
                                    <span className="text-sm">{notification.message}</span>
                                </div>
                            </div>
                        )}
                    </form>
                    <div className="flex justify-end mt-4">
                            <button
                                    type="button"
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    onClick={() => navigate("/claim")}
                            >
                                    Next
                            </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
    </>
);
};

export default UserDashboard;
