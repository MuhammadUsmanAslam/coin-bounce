import styles from "./Navbar.module.css"
import { NavLink } from "react-router-dom"
import { UseSelector, useSelector } from "react-redux/es/hooks/useSelector";

function Navbar() {

	const isAuthenticated = useSelector((state) => state.user.auth);
	return (
		<>
			<nav className={styles.navbar}>
				<NavLink to="/" className={`${styles.logo} ${styles.inActiveStyle}`}>
					CoinBounce
				</NavLink>
				<NavLink
					to="/"
					className={({ isActive }) =>
						isActive ? styles.activeStyle : styles.inActiveStyle
					}
				>
					Home
				</NavLink>

				<NavLink
					to="crypto"
					className={({ isActive }) =>
						isActive ? styles.activeStyle : styles.inActiveStyle
					}
				>
					CryptoCurrencies
				</NavLink>

				<NavLink
					to="blogs"
					className={({ isActive }) =>
						isActive ? styles.activeStyle : styles.inActiveStyle
					}
				>
					Blogs
				</NavLink>

				<NavLink
					to="submit"
					className={({ isActive }) =>
						isActive ? styles.activeStyle : styles.inActiveStyle
					}
				>
					Submit a blog
				</NavLink>

				{isAuthenticated ? (
					<NavLink>
						<button className={styles.signOutButton}>Signout</button>
					</NavLink>
				) : (
					<div>
						<NavLink
							to="login"
							className={({ isActive }) =>
								isActive ? styles.activeStyle : styles.inActiveStyle
							}
						>
							<button className={styles.logInButton}>Log In</button>
						</NavLink>

						<NavLink
							to="signup"
							className={({ isActive }) =>
								isActive ? styles.activeStyle : styles.inActiveStyle
							}
						>
							<button className={styles.signUpButton}>Sign Up</button>
						</NavLink>
					</div>
				)}
			</nav>
			<div className={styles.separator}>
				
			</div>
		</>
	)
}

export default Navbar
