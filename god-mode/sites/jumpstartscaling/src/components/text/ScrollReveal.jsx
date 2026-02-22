import { motion } from "framer-motion";

export default function ScrollReveal({ text }) {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            className="flex flex-wrap overflow-hidden my-8 p-6 bg-gray-900/50 rounded-lg border-l-4 border-blue-500"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
        >
            {words.map((word, index) => (
                <motion.span
                    variants={child}
                    key={index}
                    className="mr-2 text-xl md:text-2xl text-gray-200 font-medium"
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
