"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const marcas = [
  {
    nombre: "Adidas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  },
  {
    nombre: "Reebok",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Reebok_2019_logo.svg",
  },

  {
    nombre: "LG",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/LG_symbol.svg",
  },

  {
    nombre: "PlayStation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg",
  },
  {
    nombre: "Xbox",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg",
  },
  {
    nombre: "Nintendo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg",
  },
  {
    nombre: "Samsung",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Samsung_old_logo_before_year_2015.svg",
  },
  {
    nombre: "Philips",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Philips_logo_new.svg",
  },
  {
    nombre: "Electrolux",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Electrolux_logo.svg",
  },
];

export default function MarcasCarousel() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-900 py-6 sm:py-10">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent z-10" />

      <motion.div
        className="flex gap-12 items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          ease: "linear",
          duration: 20,
          repeat: Infinity,
        }}
      >
        {[...marcas, ...marcas].map((marca, index) => (
          <div
            key={index}
            className="flex items-center justify-center min-w-[150px]"
          >
            <Image
              src={marca.logo}
              alt={marca.nombre}
              width={120}
              height={60}
              className="object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
