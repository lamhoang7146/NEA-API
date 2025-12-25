import { Module } from '@nestjs/common';
import { GraphQLModule, registerEnumType } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLError } from 'graphql';

import {
  GraphQLFormattedError,
  OriginalErrorResponse,
  ValidationErrorItem,
  ValidationErrorDetail,
  isValidationErrorResponse,
} from './interfaces';
import { Role } from '@/common/constants';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role enum',
});

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/configs/graphql/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      csrfPrevention: false,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': {
          path: '/subscriptions',
        },
      },
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      formatError: (error: GraphQLError): GraphQLFormattedError => {
        const originalError = error.extensions?.originalError as
          | OriginalErrorResponse
          | undefined;

        if (originalError && isValidationErrorResponse(originalError)) {
          const validationErrors = GraphQlModule.transformValidationErrors(
            originalError.message,
          );

          return {
            error: true,
            code: 'BAD_REQUEST',
            message: 'Validation failed',
            statusCode: 400,
            validationErrors,
          };
        }

        const errorCode =
          typeof error.extensions?.code === 'string'
            ? error.extensions.code
            : 'INTERNAL_SERVER_ERROR';

        const errorMessage = GraphQlModule.getSafeErrorMessage(
          originalError,
          error,
        );

        const statusCode = originalError?.statusCode
          ? Number(originalError.statusCode)
          : 500;

        return {
          error: true,
          code: errorCode,
          message: errorMessage,
          statusCode,
        };
      },
    }),
  ],
})
export class GraphQlModule {
  private static transformValidationErrors(
    errors: ValidationErrorItem[],
  ): ValidationErrorDetail[] {
    const result: ValidationErrorDetail[] = [];

    errors.forEach((error: ValidationErrorItem) => {
      if (error.property && typeof error.property === 'string') {
        const errorMessage = GraphQlModule.getErrorMessage(error);

        if (errorMessage) {
          result.push({
            field: error.property,
            error: errorMessage,
          });
        }
      }
    });

    return result;
  }

  private static getErrorMessage(error: ValidationErrorItem): string {
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }

    if (error.constraints && typeof error.constraints === 'object') {
      const constraintValues = Object.values(error.constraints);
      if (
        constraintValues.length > 0 &&
        typeof constraintValues[0] === 'string'
      ) {
        return constraintValues[0];
      }
    }

    return `Validation failed for field ${error.property}`;
  }

  private static getSafeErrorMessage(
    originalError: OriginalErrorResponse | undefined,
    graphQLError: GraphQLError,
  ): string {
    if (!originalError?.message) {
      return graphQLError.message;
    }

    if (typeof originalError.message === 'string') {
      return originalError.message;
    }

    return graphQLError.message;
  }
}
