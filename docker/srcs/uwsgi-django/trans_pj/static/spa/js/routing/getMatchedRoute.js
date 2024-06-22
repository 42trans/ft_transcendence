import { routeTable } from "./routeTable.js";
import { isValidParam } from "../utility/isValidParam.js"

const DEBUG_LOG = 1;


const normalizePath = (path) => {
    return path.replace(/\/+/g, '/');
};


const comparePathParts = async (routeParts, currentPathParts) => {
    let params = {};
    for (let i = 0; i < routeParts.length; i++) {
        const part = routeParts[i];
        const currentPart = currentPathParts[i];

        if (part.startsWith(':')) {
            const paramName = part.slice(1);
            if (i !== routeParts.length - 1) {
                return { isMatch: false, params: {} };
            }

            const isValid = await isValidParam(paramName, currentPart);
            if (!isValid) {
                if (DEBUG_LOG) { console.log(` ${paramName} -> x InvalidParam: ${currentPart}`); }
                return { isMatch: false, params: {} };
            }

            params[paramName] = currentPart;
            if (DEBUG_LOG) { console.log(` ${paramName} -> o validParam: ${currentPart}`); }

        } else if (part !== currentPart) {
            return { isMatch: false, params: {} };
        }
    }
    return { isMatch: true, params };
};


export const getMatchedRoute = async (currentPath) => {
    const excludeRoutes = ['userInfoBase', 'dmWithUserBase'];
    const normalizedPath = normalizePath(currentPath);

    for (const routeKey in routeTable) {
        if (excludeRoutes.includes(routeKey)) {
            continue;
        }

        const route = routeTable[routeKey];
        const routeParts = route.path.split('/').filter(part => part);
        const currentPathParts = normalizedPath.split('/').filter(part => part);

        if (routeParts.length !== currentPathParts.length) {
            continue;
        }

        const { isMatch, params } = await comparePathParts(routeParts, currentPathParts);
        if (isMatch) {
            const foundRoute = { ...route, params };
            if (DEBUG_LOG) { console.log(` match -> ${foundRoute.path}`); }
            return foundRoute;
        }
    }

    if (DEBUG_LOG) { console.log(` NO match -> top`); }
    return routeTable['top'];
};
