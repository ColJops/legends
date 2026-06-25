import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import LegendsPage from "../pages/LegendsPage";

const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <LegendsPage />,
            },
            {
                path: "legends",
                element: <LegendsPage />,
            },
        ],
    },
]);

export default AppRouter;
