Version 0.8.2 Released
########################

:date: 2014-01-01
:slug: release082
:author: Andres Cabrera
:tags: release

I'm happy to announce the release of version 0.8.2. This release includes many fixes and changes, in particular a new MIDI handling mechanism which solves some serious crashing issues on OS X, and MIDI learn functionality. If you are feeling adventurous, you can also try the new proof of concept debugger front-end, but you will also need to build Csound yourself using the 'csdebugger' branch.

This release also takes advantage of Csound's new ability to compile instruments while running. You can now use the Scratch Pad and the editor to send instruments to the running engine with 'Evaluate Section" or "Evaluate Selection".

There is also a spiffy new "white" theme. The green theme is still too radical and has a few rough edges:

.. image:: |filename|/images/csoundqt082.png
   :scale: 50 %
   :alt: CsoundQt White theme
   :align: center
   :target: |filename|/images/csoundqt082.png

You can get the source and pre-built binaries for OS X in the `SourceForge 0.8.2 files page <https://sourceforge.net/projects/qutecsound/files/CsoundQt/0.8.2/>`_.
