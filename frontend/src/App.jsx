import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState("");
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateForm = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/generate_form`, { prompt });
      if (response.data && Array.isArray(response.data.form)) {
        setFormFields(response.data.form);
      } else {
        alert("Invalid response from server.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Something went wrong while generating the form.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-indigo-200">

      {/* Navbar */}
      <header className="bg-indigo-600 text-white px-8 py-4 shadow-md w-full">
        <h1 className="text-3xl font-bold">HappyForm.ai 🎉</h1>
      </header>

      {/* Main */}
      <main className="flex-1 w-full flex flex-col p-8">
        <div className="w-full">

          {/* Prompt Input */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8 w-full">
            <input
              type="text"
              className="flex-1 p-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white text-gray-900"
              placeholder="Enter your prompt (e.g., Create a safety checklist for opening a restaurant)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={generateForm}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-md"
            >
              {loading ? "Generating..." : "Generate Form"}
            </button>
          </div>

          {/* Form Area */}
          <div className="bg-white rounded-lg shadow-md p-8 w-full">
            {formFields.length > 0 ? (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {formFields.map((field, index) => {
                  if (!field) return null;

                  const type = field.field_type; // 🛠️ using field_type now
                  const label = field.label || "Label";
                  const placeholder = field.placeholder || "Enter here";
                  const required = field.required || false;
                  const defaultValue = field.default ?? "";

                  const fieldId = `field-${index}`;

                  if (["text", "email", "tel", "date"].includes(type)) {
                    return (
                      <div key={index}>
                        <label htmlFor={fieldId} className="block mb-2 font-semibold text-gray-700">{label}</label>
                        <input
                          id={fieldId}
                          type={type}
                          required={required}
                          defaultValue={defaultValue}
                          placeholder={placeholder}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white text-gray-900"
                        />
                      </div>
                    );
                  } else if (type === "textarea") {
                    return (
                      <div key={index} className="col-span-1 md:col-span-2">
                        <label htmlFor={fieldId} className="block mb-2 font-semibold text-gray-700">{label}</label>
                        <textarea
                          id={fieldId}
                          required={required}
                          placeholder={placeholder}
                          defaultValue={defaultValue}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white text-gray-900"
                          rows={4}
                        ></textarea>
                      </div>
                    );
                  } else if (type === "checkbox") {
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={fieldId}
                          required={required}
                          defaultChecked={defaultValue}
                          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={fieldId} className="text-gray-700">{label}</label>
                      </div>
                    );
                  } else {
                    return null; // unknown field_type fallback
                  }
                })}
              </form>
            ) : (
              <p className="text-gray-500 text-center">Generated form fields will appear here!</p>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}

export default App;
