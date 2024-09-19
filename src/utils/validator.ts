
//@ts-nocheck
// todo  类型处理
type EIP712Types = {
    [propsKey: string]: any
}
function _sanitizeData(data: EIP712Types) {
    const TYPED_MESSAGE_SCHEMA = {
        type: 'object',
        properties: {
            types: {
                type: 'object',
                additionalProperties: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            type: { type: 'string' },
                        },
                        required: ['name', 'type'],
                    },
                },
            },
            primaryType: { type: 'string' },
            domain: { type: 'object' },
            message: { type: 'object' },
        },
        required: ['types', 'primaryType', 'domain', 'message'],
    };
    const sanitizedData: EIP712Types = {};
    for (const key in TYPED_MESSAGE_SCHEMA.properties) {
        if (data[key]) {
            sanitizedData[key] = data[key];
        }
    }
    if ('types' in sanitizedData) {
        sanitizedData.types = Object.assign({ EIP712Domain: [] }, sanitizedData.types);
    }
    return sanitizedData;
}



// eip712 过滤签名消息
export function vaildatorEIP712(EIP712Data: EIP712Types) {
    try {
        EIP712Data = typeof EIP712Data == 'string' ? JSON.parse(EIP712Data) : EIP712Data
    } catch (error) {
        console.log('EIP712Data is not a valid JSON string')
    }
    try {
        // 保留标准结构
        EIP712Data = _sanitizeData(EIP712Data)
        // 生成真实签名数据
        const extractedData: EIP712Types = {}
        const realRequestFields = EIP712Data.types[EIP712Data.primaryType]
        realRequestFields.map(({ name }: { name: any }) => {
            extractedData[name] = EIP712Data.message[name]
        })
        EIP712Data.message = extractedData
        return EIP712Data
    } catch (err) {
        console.error("parseEIP712 error")
    }
    return EIP712Data

}




export function resemblesEvmAddress(string = '') {
    // hex prefix 2 + 20 bytes
    return string.length === (2 + (20 * 2))
}