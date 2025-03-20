import { AIContext, AnyObject } from '../../api';
declare const _default: (server: any, context: AIContext, authenticator?: (message: {
    request: AnyObject;
    headers: AnyObject;
    params: AnyObject;
}) => Promise<boolean>) => void;
export default _default;
