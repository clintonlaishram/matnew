"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const BusinessForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    establishedYear: "",
    productOrService: "",
    contactNumber: "",
    website: "",
    description: "",
    notificationType: "email", // Default notification type
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Insert form data into Supabase
    const { data, error } = await supabase.from("businesses").insert([formData]);

    if (error) {
      console.error("Error inserting data:", error.message);
      alert("An error occurred while submitting the form.");
    } else {
      alert("Form submitted successfully!");

      // Send notification
      const notificationResponse = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationType: formData.notificationType,
          email: formData.website,
          name: formData.name,
        }),
      });

      const result = await notificationResponse.json();
      if (result.success) {
        alert("Notification sent successfully!");
      } else {
        alert("Failed to send notification.");
      }
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Business Registration Form</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-2">Name of the Business:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-600 mb-2">Notification Preference:</label>
          <select
            name="notificationType"
            value={formData.notificationType}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="email">Email</option>
          </select>
        </div>

        {/* Add other form fields here */}

        <button
          type="submit"
          className="p-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BusinessForm;
