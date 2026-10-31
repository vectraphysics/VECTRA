# Third-party notices

## PhysicsHub double-pendulum equations

The closed-form double-pendulum equations used in
`src/lib/doublePendulumPhysics.ts` are adapted from:

- Project: PhysicsHub
- Source file: [`simulations/DoublePendulum.jsx`](https://github.com/physicshub/physicshub.github.io/blob/bf7637238edf40e7b34021c43dc2abf45248f4db/simulations/DoublePendulum.jsx)
- Source repository: https://github.com/physicshub/physicshub.github.io
- Source revision: `bf7637238edf40e7b34021c43dc2abf45248f4db`
- Original copyright: Copyright (c) 2025 physicshub
- Licence: MIT

The equations are adapted to VECTRA's TypeScript physics module. The optional
damping term in the original implementation is omitted here; VECTRA's current
model represents the ideal conservative system with zero damping. The VECTRA
canvas renderer, React controls, integration loop, energy readouts, and page
layout are separate VECTRA implementations.

### MIT licence notice

Copyright (c) 2025 physicshub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
