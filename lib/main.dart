import 'dart:async';
import 'dart:ui_web' as ui;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:web/web.dart' as web;

Future main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    await InAppWebViewController.setWebContentsDebuggingEnabled(kDebugMode);
  }

  // Register the view factory for Web support
  if (kIsWeb) {
    ui.platformViewRegistry.registerViewFactory(
      'tourguide-web-frame',
      (int viewId, {Object? params}) {
        final iframe = web.HTMLIFrameElement();
        iframe.src = 'assets/assets/www/index.html';
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        return iframe;
      },
    );
  }

  runApp(const MaterialApp(
    debugShowCheckedModeBanner: false,
    home: MyApp(),
  ));
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final GlobalKey webViewKey = GlobalKey();

  InAppWebViewController? webViewController;
  InAppLocalhostServer localhostServer = InAppLocalhostServer(documentRoot: 'assets/www');
  
  InAppWebViewSettings settings = InAppWebViewSettings(
    isInspectable: kDebugMode,
    mediaPlaybackRequiresUserGesture: false,
    allowsInlineMediaPlayback: true,
    iframeAllow: "camera; microphone",
    iframeAllowFullscreen: true,
    javaScriptEnabled: true,
    domStorageEnabled: true,
    useShouldOverrideUrlLoading: true,
    useHybridComposition: true,
    allowsBackForwardNavigationGestures: true,
    allowFileAccessFromFileURLs: true,
    allowUniversalAccessFromFileURLs: true,
    mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
    verticalScrollBarEnabled: false,
    horizontalScrollBarEnabled: false,
  );

  double progress = 0;
  bool isServerRunning = false;

  @override
  void initState() {
    super.initState();
    if (!kIsWeb) {
      startServer();
    } else {
      setState(() => isServerRunning = true);
    }
  }

  Future<void> startServer() async {
    await localhostServer.start();
    if (mounted) {
      setState(() {
        isServerRunning = true;
      });
    }
  }

  @override
  void dispose() {
    if (!kIsWeb) {
      localhostServer.close();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!isServerRunning) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // Main App Content
    Widget appContent = PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (!kIsWeb && webViewController != null && await webViewController!.canGoBack()) {
          webViewController!.goBack();
        } else {
          if (context.mounted && Navigator.canPop(context)) {
            Navigator.pop(context);
          }
        }
      },
      child: Column(
        children: <Widget>[
          if (!kIsWeb && progress < 1.0)
            LinearProgressIndicator(value: progress, color: const Color(0xFF00E6F6), backgroundColor: Colors.transparent),
          Expanded(
            child: kIsWeb
                ? const HtmlElementView(viewType: 'tourguide-web-frame')
                : InAppWebView(
                    key: webViewKey,
                    initialUrlRequest: URLRequest(
                      url: WebUri("http://localhost:8080/index.html"),
                    ),
                    initialSettings: settings,
                    onWebViewCreated: (controller) {
                      webViewController = controller;
                    },
                    onProgressChanged: (controller, progress) {
                      setState(() {
                        this.progress = progress / 100;
                      });
                    },
                  ),
          ),
        ],
      ),
    );

    // On Web, show fullscreen without any frame
    if (kIsWeb) {
      return Scaffold(
        backgroundColor: const Color(0xFF090B10),
        body: appContent,
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF090B10),
      body: appContent,
    );
  }
}
