SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

USE AdventureWorks2022;
GO

CREATE OR ALTER PROCEDURE usp_GetProducts
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ProductID, Name, ProductNumber, Color, ListPrice, ProductSubcategoryID
    FROM Production.Product
    ORDER BY ProductID;
END
GO

CREATE OR ALTER PROCEDURE usp_GetProductsWithCategory
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.ProductID,
        p.Name AS ProductName,
        p.ProductNumber,
        p.ListPrice,
        sc.Name AS SubcategoryName,
        c.Name AS CategoryName
    FROM Production.Product p
    INNER JOIN Production.ProductSubcategory sc
        ON p.ProductSubcategoryID = sc.ProductSubcategoryID
    INNER JOIN Production.ProductCategory c
        ON sc.ProductCategoryID = c.ProductCategoryID
    ORDER BY p.ProductID;
END
GO

CREATE OR ALTER PROCEDURE usp_InsertProduct
    @Name NVARCHAR(50),
    @ProductNumber NVARCHAR(25),
    @Color NVARCHAR(15) = NULL,
    @ListPrice MONEY,
    @ProductSubcategoryID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Production.Product
        (Name, ProductNumber, Color, ListPrice, ProductSubcategoryID,
         SafetyStockLevel, ReorderPoint, StandardCost, DaysToManufacture,
         SellStartDate, rowguid, ModifiedDate)
    VALUES
        (@Name, @ProductNumber, @Color, @ListPrice, @ProductSubcategoryID,
         100, 75, @ListPrice * 0.6, 1,
         GETDATE(), NEWID(), GETDATE());

    SELECT SCOPE_IDENTITY() AS NewProductID;
END
GO

CREATE OR ALTER PROCEDURE usp_UpdateProduct
    @ProductID INT,
    @Name NVARCHAR(50),
    @Color NVARCHAR(15) = NULL,
    @ListPrice MONEY
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Production.Product
    SET Name = @Name,
        Color = @Color,
        ListPrice = @ListPrice,
        ModifiedDate = GETDATE()
    WHERE ProductID = @ProductID;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

CREATE OR ALTER PROCEDURE usp_DeleteProduct
    @ProductID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Production.Product
    WHERE ProductID = @ProductID;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO