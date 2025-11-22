import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function AddAddressModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[200]">

      <div className="bg-white p-6 w-full max-w-lg rounded-lg shadow-xl">
        
        <h2 className="text-2xl font-semibold mb-4">Add New Address</h2>

        <div className="grid grid-cols-2 gap-4">

          <Input name="fullName" placeholder="Full Name" onChange={handleChange} />
          <Input name="phone" placeholder="Phone" onChange={handleChange} />
          <Input name="pincode" placeholder="Pincode" onChange={handleChange} />
          <Input name="state" placeholder="State" onChange={handleChange} />
          <Input name="city" placeholder="City" onChange={handleChange} />

          <textarea
            name="addressLine1"
            placeholder="Address Line 1"
            onChange={handleChange}
            className="col-span-2 border rounded p-2"
          />

          <Input name="addressLine2" placeholder="Address Line 2" onChange={handleChange} />
          <Input name="landmark" placeholder="Landmark" onChange={handleChange} />

        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-purple-600 text-white" onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </div>
  );
}
