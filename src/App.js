import logo from './logo.svg';
import './App.css';
import Layout from './layout/Layout';
import useLoadDefaultMethod from './services/Init';

function App() {
  useLoadDefaultMethod();
  return (
    <Layout />
  );
}

export default App;
