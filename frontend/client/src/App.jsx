import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MapRouting from "./components/MapRouting";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            KidGo
          </Link>
          <ul className="nav-menu">
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <Link to="/map">Lên kế hoạch tuyến đường</Link>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <section id="center">
                <div className="hero">
                  <img
                    src={heroImg}
                    className="base"
                    width="170"
                    height="179"
                    alt=""
                  />
                  <img src={reactLogo} className="framework" alt="React logo" />
                  <img src={viteLogo} className="vite" alt="Vite logo" />
                </div>
                <div>
                  <h1>Chào mừng đến KidGo</h1>
                  <p>Giải pháp quản lý và theo dõi trẻ em an toàn</p>
                </div>
                <Link to="/map" className="btn-map">
                  Lên kế hoạch tuyến đường ngay
                </Link>
              </section>

              <div className="ticks"></div>

              <section id="next-steps">
                <div id="docs">
                  <svg className="icon" role="presentation" aria-hidden="true">
                    <use href="/icons.svg#documentation-icon"></use>
                  </svg>
                  <h2>Tính năng chính</h2>
                  <p>Các tính năng của KidGo</p>
                  <ul>
                    <li>
                      <a href="#map">
                        <img className="logo" src={viteLogo} alt="" />
                        Lên kế hoạch tuyến đường
                      </a>
                    </li>
                    <li>
                      <a href="#track">
                        <img className="button-icon" src={reactLogo} alt="" />
                        Theo dõi vị trí
                      </a>
                    </li>
                  </ul>
                </div>
              </section>

              <div className="ticks"></div>
              <section id="spacer"></section>
            </>
          }
        />

        <Route path="/map" element={<MapRouting />} />
      </Routes>
    </Router>
  );
}

export default App;
