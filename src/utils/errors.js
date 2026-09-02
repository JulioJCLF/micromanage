import toast from 'react-hot-toast';

export const ErrorCode = {
  DB_UNKNOWN: 'DB_UNKNOWN',
  DB_UNAUTHORIZED: 'DB_UNAUTHORIZED',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
};

const errorMessages = {
  [ErrorCode.DB_UNKNOWN]: 'Ocorreu um erro desconhecido no banco de dados.',
  [ErrorCode.DB_UNAUTHORIZED]: 'Você não tem permissão para realizar esta ação.',
  [ErrorCode.DB_NOT_FOUND]: 'O recurso solicitado não foi encontrado.',
  [ErrorCode.NETWORK_ERROR]: 'Sem conexão com a internet ou servidor fora do ar.',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Email ou senha incorretos.',
  [ErrorCode.VALIDATION_ERROR]: 'Verifique se todos os campos estão preenchidos corretamente.',
};

export const handleError = (error, contextMsg = '') => {
  console.error("Error context:", contextMsg, error);
  
  let code = ErrorCode.DB_UNKNOWN;
  
  if (error?.code) {
    if (error.code === '23505') code = ErrorCode.VALIDATION_ERROR; 
    if (error.code === '42P01') code = ErrorCode.DB_UNKNOWN; 
    if (error.code.startsWith('22')) code = ErrorCode.VALIDATION_ERROR; 
  }
  
  if (error?.message?.toLowerCase().includes('invalid login credentials')) {
    code = ErrorCode.AUTH_INVALID_CREDENTIALS;
  }

  if (error?.message?.toLowerCase().includes('row-level security')) {
    code = ErrorCode.DB_UNAUTHORIZED;
  }
  
  if (error?.message?.toLowerCase().includes('fetch')) {
    code = ErrorCode.NETWORK_ERROR;
  }

  const message = errorMessages[code] || errorMessages[ErrorCode.DB_UNKNOWN];
  toast.error(`${contextMsg ? contextMsg + ': ' : ''}${message}`);
  
  return code;
};
