import { Popover } from "radix-ui";

interface CustomPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  align?: "start" | "center" | "end";
}
export const CustomPopover = ({
  trigger,
  children,
  isOpen,
  setIsOpen,
  align = "center",
}: CustomPopoverProps) => {
  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          className="min-w-12 min-h-8 w-fit h-fit bg-white shadow-sm rounded-lg mt-2 z-10"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
