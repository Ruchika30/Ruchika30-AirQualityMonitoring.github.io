import React, { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import './App.css';


const HomePage = lazy(() => import('./pages/HomePg/Dashboard'))

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div className="loader centerLoader" />}>
        <Switch>
          <Route exact path="/" component={HomePage} />
        </Switch>
      </Suspense>
    </Router>

  );
}

export default App;
