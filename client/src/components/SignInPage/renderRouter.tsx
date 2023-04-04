import { render } from "@testing-library/react";
import {
  createMemoryRouter,
  RouteObject,
  RouterProvider,
} from "react-router-dom";

const renderRouter = (
  routes: RouteObject[],
  options?: Parameters<typeof createMemoryRouter>[1],
) => {
  const router = createMemoryRouter(routes, options);

  return render(<RouterProvider router={router} />);
};

export default renderRouter;
