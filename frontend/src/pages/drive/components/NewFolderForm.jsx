import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MdFolder, MdCheck, MdClose } from "react-icons/md";

const itemSchema = z.object({
  name: z.string().min(3, "Name is required min 3 characters").max(100, "Name must be less than 100 characters").trim(),
});

const NewFolderForm = ({ onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemSchema),
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="mb-6 flex flex-col gap-1 bg-blue-50 p-4 rounded-lg border border-blue-200"
    >
      <div className="flex items-center gap-3">
        <MdFolder size={24} className="text-blue-500" />
        <input
          type="text"
          placeholder="Folder name"
          {...register("name")}
          className={`flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white ${
            errors.name ? "border-red-500" : ""
          }`}
          autoFocus
        />
        <button type="submit" className="text-green-600 hover:text-green-800">
          <MdCheck size={24} />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <MdClose size={24} />
        </button>
      </div>
      {errors.name && (
        <span className="text-xs text-red-500 ml-9">{errors.name.message}</span>
      )}
    </form>
  );
};

export default NewFolderForm;
