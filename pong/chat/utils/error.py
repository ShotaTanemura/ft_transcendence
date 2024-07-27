class AppError(Exception):
    def __init__(self, message, log, status_code=500):
        super().__init__(message)
        self.log = log
        self.status_code = status_code

    def to_dict(self):
        return {'message': str(self), 'log': self.log, 'status_code': self.status_code}


# クライアントエラー
class ClientError(AppError):
    def __init__(self, message, log, status_code=400):
        super().__init__(message, log, status_code)

class BadRequestError(ClientError):
    def __init__(self, message="", log=""):
        super().__init__("Bad Request " + message, log, 400)

class UnauthorizedError(ClientError):
    def __init__(self, message="", log=""):
        super().__init__("Unauthorized " + message, log, 401)

class ForbiddenError(ClientError):
    def __init__(self, message="", log=""):
        super().__init__("Forbidden " + message, log, 403)

class NotFoundError(ClientError):
    def __init__(self, message="", log=""):
        super().__init__("Not Found " + message, log, 404)

class ValidationError(ClientError):
    def __init__(self, message="", log=""):
        super().__init__("Validation Error " + message, log, 422)


# サーバーエラー
class ServerError(AppError):
    def __init__(self, message, log, status_code=500):
        super().__init__(message, log, status_code)

# メンテナンス、アップグレード、サーバ障害
class ServiceUnavailableError(ServerError):
    def __init__(self, message="", log=""):
        super().__init__("Service Unavailable " + message, log, 503)

# データベースエラー
class DatabaseError(ServerError):
    def __init__(self, message="", log=""):
        super().__init__("Database Error " + message, log, 500)

# 外部サービスエラー
class ExternalAPIError(ServerError):
    def __init__(self, message="", log=""):
        super().__init__("External API Error " + message, log, 500)

class ExternalServiceTimeoutError(ServerError):
    def __init__(self, message="", log=""):
        super().__init__("External Service Timeout Error " + message, log, 500)


# ビジネスロジックエラー
class BusinessLogicError(ClientError):
    def __init__(self, message="", log=""):
        super().__init__("Logic Error " + message, log, 400)

class ResourceConflictError(ClientError):
    def __init__(self, message="", log=""):
        super().__init__("Resource Conflict " + message, log, 409)
