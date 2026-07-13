import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

interface NavLinksProps {
  /** Class name para sa container div */
  className?: string
  /** Class name para sa bawat Link element */
  linkClassName?: string
  /** onClick handler para sa bawat link (hal. para isara ang mobile menu) */
  onClick?: () => void
}

interface NavLink {
  to: string
  label: string
}

export default function NavLinks({ className, linkClassName, onClick }: NavLinksProps) {
  const { isLoggedIn, user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const links: NavLink[] = [
    { to: "/", label: "Home" },
    ...(isLoggedIn
      ? (isAdmin
        ? [{ to: "/admin", label: "Dashboard" }]
        : [])
      : [
          { to: "/login", label: "Login" },
          { to: "/register", label: "Register" },
        ]),
  ]

  return (
    <div className={className}>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onClick}
          className={linkClassName}
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
