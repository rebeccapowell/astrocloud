---
id: 771
title: "Supporting the WS-I Basic Profile Password Digest in a WCF client proxy"
pubDatetime: 2010-11-16T16:31:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=771"
slug: 2010-11-16-supporting-the-ws-i-basic-profile-password-digest-in-a-wcf-client-proxy
description: An overview of how to use the message inspector and custom behaviors to implement the WS-I Basic Profile Password Digest in a WCF client proxy, including a detailed guide and code examples.
categories:
  - work
tags:
  - axis2
  - digest
  - featured
  - hashed
  - password
  - security
  - soap
  - usernametoken
  - wcf
  - WS-I
  - wse
featured: true
---

How to use the message inspector and custom behaviors to override the contents of a SOAP message before it is sent, or before it is received, so we can implement the unsupported Password Digest security scheme under WCF.

You just want the code? Check it out on Github - [WCF AXIS Interop Example](https://github.com/rebeccapowell/WCF-AXIS-Interop-Example).

## Introduction to the problem

Although it is possible to consume a web service that requires the provision of a [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx) in WCF, support for the [WS-I Basic Profile 1.1 Password Digest](http://docs.oasis-open.org/wss/v1.1/wss-v1.1-spec-os-UsernameTokenProfile.pdf) is [not provided in Windows Communication Foundation](http://isyourcode.blogspot.com/2010/05/using-oasis-username-token-profile-in.html). For many developers tasked with the delivery of integrating their applications with external SOAP based web services, this becomes a challenge when this security profile is chosen by the web service provider. For those .NET developers involved in Enterprise Application Integration (EAI), WCF is the tool of choice internally and those skills are ideally also leveraged in external (B2B) projects.

Previously in the [Web Service Extensions frameworks](http://msdn.microsoft.com/en-us/library/dd560530.aspx) ([WSE 2.0](http://msdn.microsoft.com/en-us/library/aa152904.aspx) and [WSE 3.0](http://msdn.microsoft.com/en-us/library/ms977317.aspx)), Microsoft had supported this security profile and the [hashed password digest](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.passwordoption.aspx) in combination with the nonce and username. It is not entirely clear as to why Microsoft chose to exclude this option from WCF, although my assumption is that they saw it as a relatively clunky and inefficient security implementation, that had been superseded by better and more effective security mechanisms. Maybe someone from the Microsoft WCF team might like to explain that decision, but for the moment we need to understand that it is not available to us out of the box, and work around it when we need to.

## Solving the problem

Microsoft have conveniently provided us with a method of customizing the message before it is sent (and before it is received) through the use of a [Message Inspector](http://msdn.microsoft.com/en-us/library/aa717047.aspx). Using this, we can alter any part of the SOAP envelope, including the header. Since the [WS-I Basic Profile](http://msdn.microsoft.com/en-us/library/ms953977.aspx) requires us to provide a [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx) in the SOAP header, this is the ideal way to deliver the Password Digest requirement in our application.

Microsoft also offers us a solution in the form of a [Custom Security Token](http://msdn.microsoft.com/en-us/library/ms731872.aspx). Although we shall not be implementing the Custom Security Token, you can find [good examples](http://blogs.msdn.com/b/aszego/archive/2010/06/24/usernametoken-profile-vs-wcf.aspx) on the web.

Companies that deliver enterprise web services built on the Apache Axis2 SOAP stack (often written in Java), have a tendency to use this security profile. I don't know why this choice is common in this development sphere, but I have now experienced this requirement several times with companies that use this technology stack. WCF interoperability with Axis2 is challenging, but most common interop issues can be overcome using the Message Inspector.

## Overriding the message

A WCF [MessageInspector](http://msdn.microsoft.com/en-us/library/aa717047.aspx) allows us to intercept, inspect and alter messages going in and out of the service payer, either as a consumer or provider. As a consumer we are required to implement the [IClientMessageInspector](http://msdn.microsoft.com/en-us/library/system.servicemodel.dispatcher.iclientmessageinspector.aspx) interface which includes the following signature:

```csharp
public class PasswordDigestMessageInspector : IClientMessageInspector
{
  #region IClientMessageInspector Members

  public void AfterReceiveReply(ref System.ServiceModel.Channels.Message reply, object correlationState)
  {
    throw new NotImplementedException();
  }

  public object BeforeSendRequest(ref System.ServiceModel.Channels.Message request, System.ServiceModel.IClientChannel channel)
  {
    throw new NotImplementedException();
  }

  #endregion
}
```

Create a new class library and add a reference to [System.ServiceModel](http://msdn.microsoft.com/en-us/library/system.servicemodel.aspx). Add a new class as above that implements the [IClientMessageInspector](http://msdn.microsoft.com/en-us/library/system.servicemodel.dispatcher.iclientmessageinspector.aspx) interface. We are interested in the [BeforeSendRequest](http://msdn.microsoft.com/en-us/library/system.servicemodel.dispatcher.iclientmessageinspector.beforesendrequest.aspx) method, and in this method we want to override the existing SOAP header and provide the correct implementation of the [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx).

## Don't reinvent the wheel

Before we run off and start writing our own [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx) class(es) to support a Password Digest security scheme, let's remember that Microsoft have already written one. Both the WSE 2.0 and WSE 3.0 libraries included support for the Password Digest. There is no reason why we cannot use these libraries in conjunction with WCF, because the [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx) has a convenient [GetXml(XmlDocument document)](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.getxml.aspx) method, from which we can extract the [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx) XML, and inject it into the existing [Message.Headers](http://msdn.microsoft.com/en-us/library/system.servicemodel.channels.message.headers.aspx) collection.

To use this library you will need to download the [Microsoft Web Service Enhancements (3.0)](http://www.microsoft.com/downloads/en/details.aspx?FamilyID=018a09fd-3a74-43c5-8ec1-8d789091255d&displaylang=en) and extract the required DLL. Add a reference to this library to your project. Now we can reference the [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx) classes in our project. Next we need provide our MessageInspector with the username and password required to build the [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx). We can do this fairly easily by providing the information in the constructor:

```csharp
public string Username { get; set; }
public string Password { get; set; }

public PasswordDigestMessageInspector(string username, string password)
{
  this.Username = username;
  this.Password = password;
}
```

## Changing the header

We can now use these properties to construct our [UsernameToken](http://msdn.microsoft.com/en-us/library/microsoft.web.services3.security.tokens.usernametoken.aspx) and inject it as a custom message header called "Security":

```csharp
public object BeforeSendRequest(ref System.ServiceModel.Channels.Message request, System.ServiceModel.IClientChannel channel)
{
   // Use the WSE 3.0 security token class
   UsernameToken token = new UsernameToken(this.Username, this.Password, PasswordOption.SendHashed);

   // Serialize the token to XML
   XmlElement securityToken = token.GetXml(new XmlDocument());

   //
   MessageHeader securityHeader = MessageHeader.CreateHeader("Security", "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd", securityToken, false);
   request.Headers.Add(securityHeader);

   // complete
   return Convert.DBNull;
}
```

## Altering behaviors

We now need to make sure our web service proxy implements this [IClientMessageInspector](http://msdn.microsoft.com/en-us/library/system.servicemodel.dispatcher.iclientmessageinspector.aspx) method. To configure and implement our [IClientMessageInspector](http://msdn.microsoft.com/en-us/library/system.servicemodel.dispatcher.iclientmessageinspector.aspx) we need to define a [WCF custom behavior](http://msdn.microsoft.com/en-us/magazine/cc163302.aspx). Behaviors can be used to extend the service model's services, endpoints, contracts and operations ([see figure 8](http://msdn.microsoft.com/en-us/magazine/cc163302.aspx#S7)). For this example we are specifically interested in customizing the service endpoint.

First add a new class to your project so that you can implement this behavior. The behavior must implement the [IEndpointBehavior](http://msdn.microsoft.com/en-us/library/system.servicemodel.description.iendpointbehavior.aspx) interface:

```csharp
public class PasswordDigestBehavior : IEndpointBehavior
{

   #region IEndpointBehavior Members

   public void AddBindingParameters(ServiceEndpoint endpoint, System.ServiceModel.Channels.BindingParameterCollection bindingParameters)
   {
      throw new NotImplementedException();
   }

   public void ApplyClientBehavior(ServiceEndpoint endpoint, System.ServiceModel.Dispatcher.ClientRuntime clientRuntime)
   {
      throw new NotImplementedException();
   }

   public void ApplyDispatchBehavior(ServiceEndpoint endpoint, System.ServiceModel.Dispatcher.EndpointDispatcher endpointDispatcher)
   {
      throw new NotImplementedException();
   }

   public void Validate(ServiceEndpoint endpoint)
   {
      throw new NotImplementedException();
   }

   #endregion
}
```

We are interested in the [ApplyClientBehavior](http://msdn.microsoft.com/en-us/library/system.servicemodel.description.iendpointbehavior.applyclientbehavior.aspx) method so that we can instruct it to add our new custom **PasswordDigestMessageInspector**. Our custom behavior needs to pass the username and password to this class, so as in the [IClientMessageInspector](http://msdn.microsoft.com/en-us/library/system.servicemodel.dispatcher.iclientmessageinspector.aspx), we will take the username and password as constructor parameters, thus:

```csharp
public class PasswordDigestBehavior : IEndpointBehavior
{

   public string Username { get; set; }
   public string Password { get; set; }

   public PasswordDigestBehavior(string username, string password)
   {
      this.Username = username;
      this.Password = password;
   }

   #region IEndpointBehavior Members

   public void AddBindingParameters(ServiceEndpoint endpoint, System.ServiceModel.Channels.BindingParameterCollection bindingParameters)
   {
      throw new NotImplementedException();
   }

   public void ApplyClientBehavior(ServiceEndpoint endpoint, System.ServiceModel.Dispatcher.ClientRuntime clientRuntime)
   {
      clientRuntime.MessageInspectors.Add(new PasswordDigestMessageInspector(this.Username, this.Password);
   }

   public void ApplyDispatchBehavior(ServiceEndpoint endpoint, System.ServiceModel.Dispatcher.EndpointDispatcher endpointDispatcher)
   {
      throw new NotImplementedException();
   }

   public void Validate(ServiceEndpoint endpoint)
   {
      throw new NotImplementedException();
   }

   #endregion
}
```

## An example WSDL

We can now apply this behavior to our client proxy. To provide you with an adequate example, I have modified the example [Hello World example WSDL](http://oreilly.com/catalog/webservess/chapter/ch06.html) provided by O'Reilly's Web Service Essentials. I have added the necessary extensions to require the security token. Our WSDL now looks like this:

```xml
<?xml version="1.0" encoding="utf-8"?>
<definitions xmlns:tns="http://www.acme.co.uk/wsdl/HelloService.wsdl" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:ns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="HelloService" targetNamespace="http://www.acme.co.uk/wsdl/HelloService.wsdl" xmlns="http://schemas.xmlsoap.org/wsdl/">
	<types>
		<xsd:schema>
			<xsd:import schemaLocation="oasis-200401-wss-wssecurity-secext-1.0.xsd" namespace="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"/>
		</xsd:schema>
	</types>
	<message name="SecurityHeader">
		<part name="header" element="wsse:Security"/>
	</message>
	<message name="SayHelloRequest">
		<part name="firstName" type="xsd:string"/>
	</message>
	<message name="SayHelloResponse">
		<part name="greeting" type="xsd:string"/>
	</message>
	<portType name="Hello_PortType">
		<operation name="sayHello">
			<input message="tns:SayHelloRequest"/>
			<output message="tns:SayHelloResponse"/>
		</operation>
	</portType>
	<binding name="Hello_Binding" type="tns:Hello_PortType">
		<soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
		<operation name="sayHello">
			<soap:operation/>
			<input>
				<soap:header message="tns:SecurityHeader" part="header" use="literal" namespace="urn:examples:helloservice"/>
				<soap:body use="literal" namespace="urn:examples:helloservice" encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
			</input>
			<output>
				<soap:body use="literal" namespace="urn:examples:helloservice" encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
			</output>
		</operation>
	</binding>
	<service name="Hello_Service">
		<documentation>WSDL File for HelloService</documentation>
		<port name="Hello_Port" binding="tns:Hello_Binding">
			<soap:address location="http://www.acme.co.uk/axis2/HelloService"/>
		</port>
	</service>
</definitions>
```

## Generating the client proxy

The next step is to generate our client proxy classes. The easiest way to do that is to use [SvcUtil.exe](http://msdn.microsoft.com/en-us/library/aa347733.aspx). You can just [add a Service Reference](http://msdn.microsoft.com/en-us/library/bb628652.aspx) and link directly to the WSDL in your project as the source WSDL, or alternatively, you can create a BAT file and execute SvcUtil.exe with the required parameters from a Visual Studio command prompt. I will choose the latter:

```powershell
svcutil /t:code /out:Client.cs /n:*,Turnstile.Amce.v1 *.wsdl *.xsd /config:Client.config
```

Please be aware that you need local copies of all related schemas on your local file system, and they must be located in the same directly as the WSDL. SvcUtil will not download and navigate remote schema locations for you. At a minimum, you should expect to have the following files in your directory:

- oasis-200401-wss-wssecurity-secext-1.0.xsd
- oasis-200401-wss-wssecurity-utility-1.0.xsd
- xml.xsd
- xmldsig-core-schema.xsd

Add a Service Reference works in a similar way, downloading the files for you and changing the internal references to remote XSDs to those within the download directory, before finally executing SvcUtil.exe. However, should you wish to run SvcUtil outside the standard parameters (e.g. namespace changes and the very useful switch [UseSerializerForFaults](http://msdn.microsoft.com/en-us/library/cc681334.aspx), then you will need to go through the manual process.

## Adding the custom behavior

Now you have a project that contains all of the required code ready to connect to the web service described in the WSDL. We will imagine that we have another project which needs to connect to this web service using the client proxy that we have just generated. We will create a new Message Processing application (Windows Console application, or class library) that will create an instance of the client proxy and execute the SayHello method. I'm going to use a class library, so that it can be used in lots of different applications. After adding the new class library to the solution, I add a reference to the Turnstile project containing the generated client proxy code, and a reference to [System.ServiceModel](http://msdn.microsoft.com/en-us/library/system.servicemodel.aspx). A new Processor class is added with the following code to execute the sayHello() method.

```csharp
public class Processor
{
   public string SendHello(string firstName)
   {
      // Instance of our Client Proxy
      var client = new Hello_PortTypeClient("Hello_Binding");

      // Add our custom behavior
      PasswordDigestBehavior behavior = new PasswordDigestBehavior("Username", "Password");
      client.Endpoint.Behaviors.Add(behavior);

      // Say hello
      return client.sayHello(null, firstName);
   }
}
```

## Evaluating the output

If you were to switch on [message tracing and logging](http://msdn.microsoft.com/en-us/library/ms730064.aspx) on your proxy client service calls, you would now see the following output:

```xml
<s:Header>
	<Security xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
		<wsse:UsernameToken xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="SecurityToken-d8f58af7-527e-4157-8605-8c13576973ef" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
			<wsse:Username>
				<!-- Removed for security reasons -->
			</wsse:Username>
			<wsse:Password>
				<!-- Removed for security reasons -->
			</wsse:Password>
			<wsse:Nonce>
				<!-- Removed for security reasons -->
			</wsse:Nonce>
			<wsu:Created>2015-11-15T13:57:20Z</wsu:Created>
		</wsse:UsernameToken>
	</Security>
	<Action s:mustUnderstand="1" xmlns="http://schemas.microsoft.com/ws/2005/05/addressing/none">https://www.acme.co.uk/axis2/services/CreditAccountProvider</Action>
</s:Header>
```

## Conclusion

With a little bit of work, the extensibility offered by WCF means that we can deliver .NET based client proxies to any web services that use SOAP regardless of the technology stack being used by the third party to implement their web service.

## Github

There is now an updated version of this code for Visual Studio 2012 on Github: [https://github.com/rebeccapowell/WCF-AXIS-Interop-Example](https://github.com/rebeccapowell/WCF-AXIS-Interop-Example).
