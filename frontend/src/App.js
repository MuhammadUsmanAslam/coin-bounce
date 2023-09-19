import styles from "./App.module.css";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Footer from "./components/Footer/Footer";
import Error from "./pages/Error/Error";
import Protected from "./components/protected/Protected";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import { useSelector } from "react-redux";

function App() {
	const isAuth = useSelector((state) => state.user.auth);
	return (
		<div className={styles.container}>
			<BrowserRouter>
				<div className={styles.layout}>
					<Navbar />
					<Routes>
						<Route
							path="/"
							exact
							element={
								<div className={styles.main}>
									<Home />
								</div>
							}
						/>
						<Route
							path="crypto"
							exact
							element={<div className={styles.main}>Crypto Page</div>}
						/>
						<Route
							path="blogs"
							exact
							element={
								<Protected isAuth={isAuth}>
									<div className={styles.main}>Blogs Page</div>
								</Protected>
							}
						/>
						<Route
							path="submit"
							exact
							element={
								<Protected isAuth={isAuth}>
									<div className={styles.main}>Submit Page</div>
								</Protected>
							}
						/>
						<Route
							path="login"
							exact
							element={<div className={styles.main}><Login/></div>}
						/>
						<Route
							path="signup"
							exact
							element={<div className={styles.main}>Signup Page</div>}
						/>
						<Route
							path="*"
							element={<div className={styles.main}><Error/></div>}
						/>
					</Routes>
					<Footer />
				</div>
			</BrowserRouter>
		</div>
	)
}

export default App
