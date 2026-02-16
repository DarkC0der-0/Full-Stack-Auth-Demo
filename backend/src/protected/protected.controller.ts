import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

@ApiTags('protected')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('protected')
export class ProtectedController {
  private readonly logger = new Logger(ProtectedController.name);

  @Get('welcome')
  @ApiOperation({ summary: 'Get welcome message (protected route)' })
  @ApiResponse({
    status: 200,
    description: 'Returns welcome message with user info',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Welcome to the application' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  getWelcome(@CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`Welcome endpoint accessed by user: ${user.email}`);
    return {
      message: 'Welcome to the application',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile (protected route)' })
  @ApiResponse({
    status: 200,
    description: 'Returns current user information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`Profile endpoint accessed by user: ${user.email}`);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
