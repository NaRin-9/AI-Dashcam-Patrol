// middleware/auth: ตรวจสอบ JWT token และสิทธิ์ตาม role
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"ai-dashcam-patrol/backend/internal/entities/auth"
	"ai-dashcam-patrol/backend/internal/entities/user"
)

// AuthMiddleware ตรวจสอบ Bearer token จาก Authorization header แล้วตั้งค่า user info ใน context
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := &auth.TokenClaims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		// ตั้งค่า user info ใน context
		c.Set("userId", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("roleId", claims.RoleID)
		c.Set("roleName", claims.RoleName)
		c.Next()
	}
}

// RequireRole ตรวจสอบว่า role ของ user อยู่ใน roles ที่อนุญาต
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleName, exists := c.Get("roleName")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		userRole := roleName.(string)
		for _, r := range roles {
			if userRole == r {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		c.Abort()
	}
}

// GetCurrentUser ดึงข้อมูล user จาก context
func GetCurrentUser(c *gin.Context) user.User {
	userID, _ := c.Get("userId")
	username, _ := c.Get("username")
	roleID, _ := c.Get("roleId")
	roleName, _ := c.Get("roleName")

	return user.User{
		ID:       userID.(string),
		Username: username.(string),
		RoleID:   roleID.(int),
		RoleName: roleName.(string),
	}
}
