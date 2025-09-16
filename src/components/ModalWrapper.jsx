import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef } from "react";

const ModalWrapper = ({ open, setOpen, children, title, footer }) => {
  const cancelButtonRef = useRef(null);
  // Unique ID for aria-labelledby
  const titleId = `modal-title-${Math.random().toString(36).substring(7)}`;
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-100 w-full'
        initialFocus={cancelButtonRef}
        onClose={() => setOpen(false)}
        aria-labelledby={titleId} // Accessibility improvement
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-50 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          {/* Centering the modal panel */}
          <div className='flex min-h-full items-center justify-center p-4 text-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100' // Corrected leaveFrom typo if present
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              {/* Modal Panel: Flex column, max height, prevents growing off-screen */}
              <Dialog.Panel className='relative flex flex-col transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[90vh]'>

                {/* 1. Header Section (Non-scrollable) */}
                {title && (
                  <div className="px-4 pt-5 pb-4 sm:px-6 border-b border-gray-200">
                    {/* Render the title prop, ensuring it has the correct ID */}
                    {/* We expect the title prop to be a <Dialog.Title> or similar with id={titleId} */}
                    {title}
                  </div>
                )}

                {/* 2. Body/Content Section (Scrollable) */}
                <div className='flex-grow overflow-y-auto'> {/* Allows content to scroll */}
                  <div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
                    <div className='w-full'> {/* Removed unnecessary sm:flex sm:items-start structure unless needed */}
                      {children}
                    </div>
                  </div>
                </div>

                {/* 3. Footer Section (Non-scrollable) */}
                {footer && (
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
                    {/* Render the footer prop */}
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ModalWrapper;
