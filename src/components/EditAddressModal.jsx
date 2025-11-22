import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function EditAddressModal({ isOpen, onClose, onSave, existing }) {

  const [form, setForm] = useState(existing || {});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => onSave(form);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[200]">

      <div className="bg-white p-6 w-full max-w-lg rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Edit Address</h2>

        <div className="grid grid-cols-2 gap-4">

          <Input name="fullName" defaultValue={form.fullName} onChange={handleChange} />
          <Input name="phone" defaultValue={form.phone} onChange={handleChange} />
          <Input name="pincode" defaultValue={form.pincode} onChange={handleChange} />
          <Input name="state" defaultValue={form.state} onChange={handleChange} />
          <Input name="city" defaultValue={form.city} onChange={handleChange} />

          <textarea
            name="addressLine1"
            defaultValue={form.addressLine1}
            onChange={handleChange}
            className="col-span-2 border rounded p-2"
          />

          <Input name="addressLine2" defaultValue={form.addressLine2} onChange={handleChange} />
          <Input name="landmark" defaultValue={form.landmark} onChange={handleChange} />

        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-purple-600 text-white" onClick={handleSubmit}>Update</Button>
        </div>

      </div>
    </div>
  );
}
