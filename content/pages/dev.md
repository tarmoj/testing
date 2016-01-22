Title: Develop
Date: 2013-09-20
Lang: en

Getting the sources
--------

The source files for CsoundQt can be browsed and downloaded from Sourceforge:
[https://sourceforge.net/p/qutecsound/code/ci/master/tree/](https://sourceforge.net/p/qutecsound/code/ci/master/tree/)

You can also find source releases in the Files section.

Building
-----
To build CsoundQt you need [Qt](http://qt-project.org/) (version 4.8 or 5.0+), Csound. The [libsndfile](http://www.mega-nerd.com/libsndfile/) library will allow recording the realtime output of Csound to a file. From version 0.7 onwards, CsoundQt can be built with PythonQt support. Global MIDI I/O and control of the CsoundQt widgets can also be enabled through the [RtMidi](http://www.music.mcgill.ca/~gary/rtmidi/) library.

The easiest way to build CsoundQt is to open its qcs.pro file in QtCreator and build it there.
CsoundQt uses qmake to build, so you can build on the command line with:

	$ qmake
	$ make

The qmake project file will attempt to find the dependencies in standard locations. You can specify the locations manually and give additional options for building. Consult the qcs.pro file.

It is highly recommended you build [RtMidi](http://www.music.mcgill.ca/~gary/rtmidi/) support, as it will make MIDI I/O more stable than relying on Csound's MIDI modules which appear to have some reentrancy issues. RtMidi version 2.0.1 or greater is required. You can build support for RtMidi control of Widgets by enabling the RtMidi library using:

	$ qmake CONFIG+=rtmidi

The RtMidi library can be put in the same base directory as the CsoundQt sources, where it will be found and used. It should not be necessary to build the RtMidi library to use it, although some users have reported that they have had to do that before building CsoundQt.

You can build optional support for PythonQt:

	$ qmake CONFIG+=pythonqt

The PythonQt librarycan be put in the same base directory as the CsoundQt sources, where it will be found and used. You must build the PythonQt libraries before using them. CsoundQt currently requires PythonQt >= 2.0.1.

There are also some detailed descriptions about building CsoundQt in
the [Csound Wiki](http://sourceforge.net/p/csound/wiki/Home/).

Translating
---

Translating CsoundQt is very easy. Just let me know you want to translate into a certain language, and I'll generate the tranlsation file. Then you can translate it with Qt Linguist, which is a very easy to use program, which will assist you in the translation. When you're done, just send the finished translation.
You can get QtLinguist with the Qt SDK, or as an individual program here:
[http://code.google.com/p/qtlinguistdownload/](http://code.google.com/p/qtlinguistdownload/)
