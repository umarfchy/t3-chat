import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  users: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
  chats: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.chat.findMany({
        include: {
          participants: true,
        },
        where: {
          participants: {
            some: {
              id: input.userId,
            },
          },
        },
      });
    }),
  messages: publicProcedure
    .input(z.object({ chatId: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.message.findMany({
        where: {
          chatId: input.chatId,
        },
      });
    }),

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),
});
