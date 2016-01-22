Version 0.9.0 Released
######################

:date: 2014-11-08
:slug: release090
:author: Andres Cabrera
:tags: release

To coincide with Csound's release of version 6.04, I'm releasing CsoundQt version 0.9.0.

.. image:: |filename|/images/CsoundQt090.png
   :scale: 50 %
   :alt: CsoundQt Debugger screenshot
   :align: center
   :target: |filename|/images/CsoundQt090.png


This version includes:

- A new virtual MIDI keyboard
- Visual display of matching (or unmatching) parenthesis
- Correct highlighting of type marks for functional opcodes (e.g. oscil:a)
- Put back status bar
- Added template list in file menu. Template directory can be set from the environment options
- Added home and opcode buttons to help dock widget
- Removed dependency on libsndfile (now using Csound's perfThread record facilties)
- Fixed tab behavior
- Updated version of Stria Synth (thanks to Emilio Giordani)
- Dock help now searches as user types (not only when return is pressed)


