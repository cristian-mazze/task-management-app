import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gestor de Tareas",
  description: "Aplicación de gestión de tareas con Next.js, React y SQL",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 py-8 bg-white text-black dark:bg-black dark:text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
