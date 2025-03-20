import { AIContext, AnyObject } from '../../api';
declare const _default: (api: AIContext, authenticator?: (message: {
    request: AnyObject;
    headers: AnyObject;
    params: AnyObject;
}) => Promise<boolean>) => any;
export default _default;
