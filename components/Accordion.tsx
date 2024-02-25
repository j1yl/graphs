import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

type Props = {
  question: string;
  children: React.ReactNode;
};

const variants = {
  open: { opacity: 1, height: "auto" },
  closed: { opacity: 0, height: 0 },
};

export default function Accordion({ question, children }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div
      initial={{
        x: -20,
        opacity: 0,
      }}
      whileInView={{
        x: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
        delay: 0.2,
      }}
      className="w-full rounded-lg border border-blue-200 px-4 py-2 text-xs text-neutral-400 shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_2px_#4bf,0_0_8px_#4bf,0_0_8px_#4bf]"
    >
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h2 className="text-white">{question}</h2>
        <ExpandLessIcon
          className={`transform ${isOpen ? "rotate-0" : "rotate-180"}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            className="mt-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
