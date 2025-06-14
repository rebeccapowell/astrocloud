---
id: 770
title: "Change the color of a transparent PNG image icon on the fly using ASP.NET MVC"
pubDatetime: 2011-01-13T11:33:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=770"
slug: 2011-01-13-change-the-color-of-a-transparent-png-image-icon-on-the-fly-using-asp-net-mvc
description: An overview of using a ColorMatrix to transform the non-transparent pixels of a PNG image on the fly using ASP.NET MVC, including a detailed guide and code examples.
categories:
  - work
tags:
  - actionresult
  - asp.net
  - icon
  - image
  - mvc
  - png
  - transparent
---

How to use a `ColorMatrix` to transform the non-transparent pixels of a PNG image on the fly using ASP.NET MVC2. Take any gray-scale transparent PNG image and apply any known system color to it and then stream it to the HTTP Response stream on the fly.

## Defining the problem

There are a variety of great icons sets out there for free, and even more for a small price. A personal favourite of mine is [Glyphish](http://glyphish.com/), produced by [Joseph Wain](http://penandthink.com/). They tend to be gray-scale by default, with the idea that you can edit them in an image editing program such as Adobe Photoshop or Gimp. However, I didn't want to edit them by hand, but provide a URL routed based solution in code to change the icon and color as and when required.

## Solving the problem

The Microsoft .NET Framework has an excellent set of imaging tools built right into the System.Drawing namespaces (i.e. the Graphics Design Interface (GDI+)). Through the use of a `ColorMatrix`, we will transpose the existing pixels of a selected image to another color. The transparent PNG image shall be loaded on the fly, altered so that only the non-transparent pixels are changed and then streamed back to the client with the correct response type.

## What is a Color Matrix?

A `ColorMatrix` and its use in color transformations is described rather well by [Mahesh Chand](http://www.c-sharpcorner.com/UploadFile/mahesh/Transformations0512192005050129AM/Transformations05.aspx) and the most appropriate paragraphs are highlighted below:

> The color of each pixel of a GDI+ image or bitmap is represented by a 32-bit number where 8-bits are used for each of the red, green, blue, and alpha components. Each of the four components is a number from 0 to 255. For red, green, and blue components, 0 represents no intensity and 255 represents full intensity.

> For the alpha component, 0 represents fully transparent and 255 represents fully opaque. A color vector includes four items, i.e., (R, G, B, A). The minimum values for this vector are (0, 0, 0, 0) and the maximum values for this vector are (255, 255, 255, 255).

> GDI+ allows the use of values between 0 and 1 where 0 represents the minimum intensity and 1 represents the maximum intensity. These values are used in a color matrix to represent the intensity and opacity of color components. For example, the color vector with the minimum values is (0, 0, 0, 0) and the color vector with maximum values is (1, 1, 1, 1).

> In color transformation, we apply a color matrix on a color vector. This can be done by multiplying a 4 x 4 matrix. However a 4 x 4 matrix supports only linear transformations such as rotation, and scaling. To perform non-linear transformations such as translation, you need to use a 5 x 5 matrix. The element of the fifth row and the fifth column of the matrix must be 1 and all of the other entries in the five columns must be 0.

## Applying the ColorMatrix

To apply the color transformation we need a [ColorMatrix](http://msdn.microsoft.com/en-us/library/system.drawing.imaging.colormatrix.aspx) that will take the RGB elements of the required [Color](http://msdn.microsoft.com/en-us/library/system.drawing.color.aspx), and transform the existing pixels to those values. Our resulting [ColorMatrix](http://msdn.microsoft.com/en-us/library/system.drawing.imaging.colormatrix.aspx) looks something like that shown below:

| 0   | 0   | 0   | 0   | 0   |
| --- | --- | --- | --- | --- |
| 0   | 0   | 0   | 0   | 0   |
| 0   | 0   | 0   | 0   | 0   |
| 0   | 0   | 0   | 1   | 0   |
| R   | G   | B   | 0   | 1   |

## Coding the ColorMatrix

Our resulting code is a method that requires the physical file path of the original image and a system [Color](http://msdn.microsoft.com/en-us/library/system.drawing.color.aspx) for the transformation.

```csharp
public class ColorHelper
{
    public static Bitmap Tint(string filePath, Color c)
    {
        // load from file
        Image original = Image.FromFile(filePath);
        original = new Bitmap(original);

        // get a graphics object from the new image
        Graphics g = Graphics.FromImage(original);

        // create the ColorMatrix
        ColorMatrix colorMatrix = new ColorMatrix(
            new float[][]{
                new float[] {0, 0, 0, 0, 0},
                new float[] {0, 0, 0, 0, 0},
                new float[] {0, 0, 0, 0, 0},
                new float[] {0, 0, 0, 1, 0},
                new float[] {c.R / 255.0f, c.G / 255.0f, c.B / 255.0f, 0, 1}
            });

        // create some image attributes
        ImageAttributes attributes = new ImageAttributes();

        // set the color matrix attribute
        attributes.SetColorMatrix(colorMatrix);

        // draw the original image on the new image
        // using the color matrix
        g.DrawImage(original, new Rectangle(0, 0, original.Width, original.Height),
            0, 0, original.Width, original.Height, GraphicsUnit.Pixel, attributes);

        // dispose the Graphics object
        g.Dispose();

        // return the image
        return (Bitmap)original;
    }
}
```

## Using the code

### A Custom ActionResult

For this example I will use ASP.NET MVC to route the requested PNG image file and color, and deliver a PNG image to the HTTP response stream. Rather than invent the wheel, [Maarten Balliauw has a rather nice example](http://blog.maartenballiauw.be/post/2008/05/ASPNET-MVC-custom-ActionResult.aspx) of how you can use a custom [ActionResult](http://msdn.microsoft.com/en-us/library/system.web.mvc.actionresult.aspx) to deliver this through an [HtmlHelper](http://msdn.microsoft.com/en-us/library/system.web.mvc.htmlhelper.aspx) Extension method. I have made minor modifications to his code to remove the extensive "if orgy".

```csharp
public class ImageResult : ActionResult
{
    public ImageResult() { }
    public Image Image { get; set; }
    public ImageFormat ImageFormat { get; set; }
    public override void ExecuteResult(ControllerContext context)
    {
        // verify properties
        if (Image == null)
        {
            throw new ArgumentNullException("Image");
        }
        if (ImageFormat == null)
        {
            throw new ArgumentNullException("ImageFormat");
        }
        // output
        var contentResponses = new Dictionary&lt;ImageFormat, string>()
                    {
                        {ImageFormat.Bmp, "image/bmp"},
                        {ImageFormat.Gif, "image/gif"},
                        {ImageFormat.Icon, "image/vnd.microsoft.icon"},
                        {ImageFormat.Jpeg, "image/jpeg"},
                        {ImageFormat.Png, "image/png"},
                        {ImageFormat.Tiff, "image/tiff"},
                        {ImageFormat.Wmf, "image/wmf"}
                    };

        context.HttpContext.Response.Clear();
        context.HttpContext.Response.ContentType = contentResponses[ImageFormat];

        // output
        Image.Save(context.HttpContext.Response.OutputStream, ImageFormat);
    }
}
```

## Adding the controller

Our controller [ActionResult](http://msdn.microsoft.com/en-us/library/system.web.mvc.actionresult.aspx) is relatively simple. The method requires a filename and color name as strings. From that we will work out the supplied Color and pass both values to the Tint() method.

```csharp
public ActionResult Image(string fileName, string colorName)
{
    // map the directory path (soem error checking would be smart here)
    var dir = Server.MapPath("/Images/Icons");

    // combine with the filename
    var path = Path.Combine(dir, fileName);

    // get the color from the supplied name (error check this too)
    Color c = Color.FromName(colorName);

    // Tint the PNG file based on file path and color selected
    Bitmap bmp = Web.Models.ColorHelper.Tint(path, c);

    // return ImageResult
    return new ImageResult { Image = bmp, ImageFormat = ImageFormat.Png };
}
```

## Mapping the route

In order for our controller method to receive the correct parameters we need to add a new named route to the MVC routing table held in the Global.asmx.cs file.

```csharp
routes.MapRoute(
    "Image", // Route name
    "image/{fileName}/{colorName}", // URL with parameters
    new { controller = "Home", action = "Image" } // Parameter defaults
);
```

## Linking to the image in the view

In our view the PNG image can be loaded using the routed URL.

```html
<img alt="red tint" src="/image/01-refresh.png/Red" />
```

## The Result

![output result example](/assets/posts/clip_image002.jpg)

## Conclusion

The Microsoft.NET Framework provides us with a flexible and fully featured Graphics Design Interface library. In combination with ASP.NET MVC we can alter transparent PNG images on the fly based on a URL. Using one image, we can offer it up in any color the framework supports as a named color.

## Credits

- [Maarten Balliauw](http://blog.maartenballiauw.be/) for the [custom ActionResult HtmlHelper Extension](http://blog.maartenballiauw.be/post/2008/05/ASPNET-MVC-custom-ActionResult.aspx) and Richard Banks for his comments on the [Needless If Statements](http://www.richard-banks.org/2010/11/needless-if-statements.html)!.
- [Joseph Wain](http://penandthink.com/) for the great icon set [Glyphish](http://glyphish.com/).
- [Mahesh Chand](http://www.csharpcorner.com/Blogs/BloggerDetails.aspx?BloggerId=mahesh) for the excellent description of [Color Matrices](http://www.c-sharpcorner.com/UploadFile/mahesh/Transformations0512192005050129AM/Transformations05.aspx) and [Hans Passant](http://stackoverflow.com/users/17034/hans-passant) for the tips on [ColorMatrix usage](http://stackoverflow.com/questions/2510013/gdi-set-all-pixels-to-given-color-while-retaining-existing-alpha-value), without which I would have missed the division by 255.0f!

## Other Resources
