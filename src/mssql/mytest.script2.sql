USE [mytest]
GO
/****** Object:  Table [dbo].[t1]    Script Date: 2016. 11. 21. 13:11:18 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[t1](
	[id] [smallint] NOT NULL,
	[text] [text] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
INSERT [dbo].[t1] ([id], [text]) VALUES (1, N'HELLO')
