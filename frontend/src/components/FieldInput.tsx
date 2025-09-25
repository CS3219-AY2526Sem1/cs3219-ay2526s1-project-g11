import { Eye, EyeOff } from "lucide-react";
import React, { InputHTMLAttributes, ReactElement, Ref, useState } from "react";

interface FieldInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "ref"> {
  password?: boolean;
  icon: ReactElement;
}

export const FieldInput = React.forwardRef<HTMLInputElement, FieldInputProps>(
  ({ password = false, icon, ...rest }, ref: Ref<HTMLInputElement>) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        {icon}
        <input
          ref={ref}
          {...rest}
          type={showPassword ? "text" : rest.type}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
          required
        />
        {password && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    );
  },
);
