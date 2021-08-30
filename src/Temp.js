import './App.scss';
// import Stream from './components/Stream';
// import Live from './components/Live';
import Streamer from './components/Temp/streamer';
import Viewer from './components/Temp/viewer';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

function App() {
    return (
        <div className="app">
            <h1> welcome to my project 1 </h1>
            <Router>
                <nav>
                    <ul>
                        <li>
                            <Link to="/stream">Streamer</Link>
                        </li>
                        <li>
                            <Link to="/viewer">Viewer</Link>
                        </li>
                    </ul>
                </nav>
                <Switch>
                    <Route path="/stream">
                        <Streamer />;
                    </Route>
                    <Route path="/viewer">
                        <Viewer />;
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}
// function StreamLive() {
//   return <Streamer />;
// }

// function ViewerLive() {
//   return <Viewer />;
// }

export default App;
