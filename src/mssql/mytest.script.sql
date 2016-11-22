USE [master]
GO
/****** Object:  Database [mytest]    Script Date: 2016. 11. 21. 13:07:51 ******/
CREATE DATABASE [mytest]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'mytest', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\mytest.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'mytest_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\mytest_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
ALTER DATABASE [mytest] SET COMPATIBILITY_LEVEL = 130
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [mytest].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [mytest] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [mytest] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [mytest] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [mytest] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [mytest] SET ARITHABORT OFF 
GO
ALTER DATABASE [mytest] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [mytest] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [mytest] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [mytest] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [mytest] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [mytest] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [mytest] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [mytest] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [mytest] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [mytest] SET  DISABLE_BROKER 
GO
ALTER DATABASE [mytest] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [mytest] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [mytest] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [mytest] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [mytest] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [mytest] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [mytest] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [mytest] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [mytest] SET  MULTI_USER 
GO
ALTER DATABASE [mytest] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [mytest] SET DB_CHAINING OFF 
GO
ALTER DATABASE [mytest] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [mytest] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [mytest] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [mytest] SET QUERY_STORE = OFF
GO
USE [mytest]
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET MAXDOP = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET LEGACY_CARDINALITY_ESTIMATION = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET PARAMETER_SNIFFING = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET QUERY_OPTIMIZER_HOTFIXES = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET QUERY_OPTIMIZER_HOTFIXES = PRIMARY;
GO
USE [mytest]
GO
/****** Object:  Table [dbo].[t1]    Script Date: 2016. 11. 21. 13:07:51 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[t1](
	[id] [smallint] NOT NULL,
	[text] [text] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
USE [master]
GO
ALTER DATABASE [mytest] SET  READ_WRITE 
GO
