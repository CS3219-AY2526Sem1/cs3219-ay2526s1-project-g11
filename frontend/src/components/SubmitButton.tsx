import React, { ButtonHTMLAttributes, Ref } from "react";

interface SubmitButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref"> {
  children?: React.ReactNode;
}

export const SubmitButton = React.forwardRef<
  HTMLButtonElement,
  SubmitButtonProps
>(({ children, ...rest }, ref: Ref<HTMLButtonElement>) => {
  return (
    <button
      type="submit"
      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-none disabled:bg-gray-400"
      {...rest}
    >
      {children}
    </button>
  );
});
