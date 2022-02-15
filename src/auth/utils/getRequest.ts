import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export type ContextType = 'http' | 'graphql';

export const getRequestByContext = (context: ExecutionContext) => {
    switch (context.getType<ContextType>()) {
        case 'graphql':
            return getGraphQLRequest(context);
        case 'http':
            return getHTTPRequest(context);
    }
}

const getGraphQLRequest = (context: ExecutionContext) => {
    return GqlExecutionContext.create(context).getContext<{ req: Request }>()
        .req;
}

const getHTTPRequest = (context: ExecutionContext) => {
    return context.switchToHttp().getRequest();
}

