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

  getAllMessages: publicProcedure
    .input(z.object({ chatId: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.message.findMany({
        where: {
          chatId: input.chatId,
        },
      });
    }),

  createMessage: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        timestamp: z.date(),
        text: z.string().min(1),
        chatId: z.string().min(1),
        senderId: z.string().min(1),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.message.create({
        data: {
          id: input.id,
          timestamp: input.timestamp,
          text: input.text,
          chatId: input.chatId,
          senderId: input.senderId,
        },
      });
    }),

  getAllNotifications: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.notification.findMany({
        where: {
          recipients: {
            some: {
              id: input.userId,
            },
          },
        },
      });
    }),

  createNotification: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        timestamp: z.date(),
        text: z.string().min(1),
        chatId: z.string().min(1),
        senderId: z.string().min(1),
        recipients: z.array(z.string().min(1)),
      })
    )
    .mutation(({ ctx, input }) => {
      console.log({ input });

      const createableData = {
        include: {
          recipients: true,
        },
        data: {
          id: input.id,
          timestamp: input.timestamp,
          text: input.text,
          chatId: input.chatId,
          senderId: input.senderId,
          recipients: {
            connect: input.recipients.map((id) => ({ id })),
          },
        },
      };

      // const createableData = {
      //   include: {
      //     recipients: true,
      //   },
      //   data: {
      //     id: input.id,
      //     timestamp: new Date(),
      //     text: "test",
      //     chatId: "clgwz9feo0000fl4tfvgpwbue", // chat-1
      //     senderId: "clgwz6a3v0000fls8wk330bdi", // user-1
      //     recipients: {
      //       connect: [
      //         { id: "clgwz6jxf0002fls8zwntrl9k" }, // user-2
      //         { id: "clgwz6r070004fls8sb1j12i2" }, // user-3
      //       ],
      //     },
      //   },
      // };

      console.log(createableData);
      return ctx.prisma.notification.create(createableData);
    }),
});
