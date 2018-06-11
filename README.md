gadget-ui
=========

Experimental JavaScript UI and data binding library

This library uses [semver](http://semver.org/) version numbering.

v 5.0.0

New development will proceed in 5.0. Previous releases will be limited to bug fixes and possibly backports of enhancements.

**What's New**

This release contains some bug fixes for existing components, including pulling some implementation details from the plain JavaScript version to the jQuery version for consistency. It also contains a significant new component called FileDialog that enables multi-part, multi-file uploads using AJAX.

This library is very much experimental, but semver and release tags are being used faithfully to provide developers with guidance on stability of features and the API.

**Why version 3.0.0?**

In semantic versioning, incrementing the leftmost version number is meant to designate a major change to the software that creates API incompatibilities with
previous versions. The API change for version 3.0.0 mainly affects LookupListInput, which now has more options in the jQuery-free version than in the jQuery version, but
also lacks some functionality of the jQuery version, such as keyboard navigation of the suggestion list.  The version change is also being used to mark a departure from the
focus on the jQuery-based library to to jQuery-free library, which only has a dependency on open-iconic and represents a better direction for the library. The jQuery-free
version of the library can be used equally well by jQuery-based and plain JavaScript applications.

As of v 3.0.0, gadget-ui comes in two distinct flavors:

- a jQuery-based version that is dependent on jQuery, partially on jQuery-UI, and partially on additional libraries.
- a plain JavaScript version that only has a dependency on open-iconic icons and optional dependency on Velocity (to enable animations) and polyfills for promises and queryselector


jQuery-free version

The options for this version of the code are largely the same. The primary difference is that you pass components native HTML elements as selectors instead of using jQuery selectors.
The LookupListInput in this version of the code has a few new features that the jQuery version lacks. Look at test/lookuplistinput.advanced.htm for an example.

[jQuery version](jquery.MD)

***License***

gadget-ui is released under the Mozilla Public License 2.0.
