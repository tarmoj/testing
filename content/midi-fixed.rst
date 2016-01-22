MIDI I/O issues fixed
#####################

:date: 2013-11-07
:slug: midi-fixed
:author: Andres Cabrera
:tags: bugfix

After the near mutiny in the Csound conference, I have worked on implementing a mechanism to handle MIDI internally rather than relying on Csound's RT MIDI modules. Initial reports suggest that things are now working as they should, although there are still a few minor issues if you want to override the new system and use Csound's modules. I hope to address them soon.
