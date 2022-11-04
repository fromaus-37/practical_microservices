/****** Object:  Table [dbo].[messages]    Script Date: 04/11/2022 05:13:48 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[messages](
	[id] [uniqueidentifier] NOT NULL,
	[?type] [nvarchar](1000) NOT NULL,
	[stream_name] [nvarchar](1000) NOT NULL,
	[position] [bigint] NOT NULL,
	[global_position] [bigint] IDENTITY(1,1) NOT NULL,
	[?data?] [nvarchar](max) NULL,
	[metadata] [nvarchar](max) NULL,
	[time] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[global_position] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[messages] ADD  DEFAULT (newid()) FOR [id]
GO

ALTER TABLE [dbo].[messages] ADD  DEFAULT (getutcdate()) FOR [time]
GO


/****** Object:  StoredProcedure [dbo].[get_category_messages]    Script Date: 04/11/2022 05:15:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[get_category_messages]
	-- Add the parameters for the stored procedure here
	@stream_name nvarchar(1000),
	@global_position bigint,
	@max_messages int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT TOP(@max_messages)
	  id,
	[?type],
	stream_name,
	position,
	global_position,
	[?data?],
	metadata,
	[time]
	FROM
	  [messages]
	WHERE
	  global_position > @global_position AND
	  stream_name LIKE @stream_name + '%'
	ORDER BY global_position
END

/****** Object:  StoredProcedure [dbo].[get_last_stream_message]    Script Date: 04/11/2022 05:15:55 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[get_last_stream_message]
	-- Add the parameters for the stored procedure here
	@stream_name nvarchar(1000)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	SELECT TOP 1
	id,
	[?type],
	stream_name,
	position,
	global_position,
	[?data?],
	metadata,
	[time]
	FROM dbo.[messages]
	WHERE stream_name = @stream_name 
	ORDER BY global_position DESC
	
END


/****** Object:  StoredProcedure [dbo].[get_stream_messages]    Script Date: 04/11/2022 05:16:22 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[get_stream_messages]
	-- Add the parameters for the stored procedure here
	@stream_name nvarchar(1000),
	@global_position bigint,
	@max_messages int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT TOP(@max_messages)
	  id,
	[?type],
	stream_name,
	position,
	global_position,
	[?data?],
	metadata,
	[time]
	FROM
	  [messages]
	WHERE
	  global_position > @global_position AND
	  stream_name = @stream_name
	ORDER BY stream_name, global_position
END

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[write_message]
	@id uniqueidentifier,
	@stream_name nvarchar(1000),
	@type nvarchar(1000),
	@data nvarchar(max) = NULL,
	@metadata nvarchar(max) = NULL,
	@expected_version bigint = NULL
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	BEGIN TRAN
	DECLARE @new_position bigint
	SET @new_position = 
		COALESCE(
			(select MAX(position) from messages where stream_name = @stream_name),
			-1) + 1

    -- Insert statements for procedure here
	INSERT INTO dbo.[messages]
		([id], [?type], [stream_name], [position], [?data?], 
		[metadata], [time])
	VALUES
		(@id, @type, @stream_name, @new_position, @data, 
		@metadata, SYSUTCDATETIME())

	COMMIT TRAN
END


