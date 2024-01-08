import { Fragment } from 'react';
import { useNavigate, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes } from '~/routes';
import { privateRoutes } from '~/routes';
import { DefaultLayout } from '~/components/Layout';
import SignIn from './pages/SignIn';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {
                        privateRoutes.map((route, index) => {
                            const Page = route.component;
                            let Layout = route.Layout;
                            if(Layout === null)
                            return(<Route key={index} path={route.path} element={<Page />}/>);
                            return(<Route key={index} path={route.path} element={<Layout><Page /></Layout>}/>);
                        })  
                    }
                    {
                        publicRoutes.map((route, index) => {
                        const Page = route.component;
                        return ( <Route key={index} path={route.path} element={<Page />}/> );
                        })
                    }
                </Routes>
            </div>
        </Router>
    );
}

export default App;
