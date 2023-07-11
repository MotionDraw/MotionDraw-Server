<p align="center">
    <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/60992aed-0ffd-4d2f-aa49-c67cd0710a34" height="300px" width="700px">
</p>

<p align="center">
    <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/19c88a1d-b3b7-4024-bfc2-00d0d15c4582" style="border:2 solid black">
</p>

# Motion Draw
`Motion Draw`는 MediaPipe의 Gesture recognition을 사용하여 `손 모양을 인식`하고 그것을 바탕으로 그림판을 구현하여 `socket 통신`으로 다른 사용자와 `함께` `그림`을 그릴 수 있게 하는 프로젝트입니다.

# Deploy

- **[MotionDraw](https://www.motiondraw.xyz/)**

|플랫폼|가능 여부|
|:-:|:-:|
|모바일|X|
|태블릿PC|X|
|브라우저|O|

|브라우저|가능 여부|
|:-:|:-:|
|Chrome|O|
|Safari|X|

# 목차

- [Motion Draw](#motion-draw)
- [Deploy](#deploy)
- [Motivation](#motivation)
- [Challenges](#challenges)
  - [1. 어떻게 허공에서 손을 움직이는 것으로 그림을 그릴것인가?](#1-어떻게-허공에서-손을-움직이는-것으로-그림을-그릴것인가)
    - [1) 손 모양 인식 Library, tenserflow.js vs mediapipe](#1-손-모양-인식-library-tensorflowjs-vs-mediapipe)
    - [2) mediapipe의 출력값을 이용하여 canvas와 webcam과 동기화하기](#2-mediapipe의-출력값을-이용하여-canvas와-webcam과-동기화하기)
    - [3) 그리기 중 모드 변경 시 선 전체가 영향을 받는 문제](#3-그리기-중-모드-변경-시-선-전체가-영향을-받는-문제)
  - [2. 어떻게 여러명이서 그림을 그릴 수 있을까?](#2-어떻게-여러명이서-그림을-그릴-수-있을까)
    - [1) 어떤 방법으로 구현할 것인가?](#1-socketio를-사용한-멀티-구현)
    - [2) 2명이서 동시에 그릴 때 서로의 선이 이어지는 경우](#2-2명이서-동시에-그릴-때-각-사용자의-선이-이어지는-경우)
    - [3) 그림을 그리고 있는 방에 입장시 어떻게 그리고 있던 그림을 불러올 것인가?](#3-그림을-그리고-있는-방-입장-시-어떻게-그리고-있던-그림을-불러올-것인가)
  - [3. UX 개선](#3-ux-개선)
    - [1) 일정 시간 후 커서 사라지게 만들기](#1-일정-시간-후-커서-사라지게-만들기)
    - [2) 마우스로 선굵기 조절 및 색 선택 기능](#2-마우스로-선굵기-조절-및-색-선택-기능)
    - [3) 모드 변경 및 색 변경 시 커서에 progress bar 구현](#3-모드-변경-및-색-변경-시-커서에-progress-bar-구현)
    - [4) 색상에 마우스 올릴 시 색 변경 기능](#4-색상에-마우스-올릴-시-색-변경-기능)
  - [4. 성능 개선 방향](#4-성능-개선-방향)
  	- [1) 어떻게 해야 그림을 더 부드럽게 그릴 수 있을까?](#1-어떻게-해야-그림을-더-부드럽게-그릴-수-있을까)
    - [2) Custom Hook을 만들어 코드 최적화](#2-custom-hook을-만들어-코드-최적화)
- [Feature](#feature)
- [Schedule](#schedule)
- [Tech Stacks](#tech-stacks)
- [Repository Link](#repository-link)
- [Member](#member)

# Motivation

마우스와 태블릿 PC와 같은 입력장치가 아닌 `웹캠`을 이용하여 "허공에 손짓으로 그림을 그리게 된다면 얼마나 편할까?" 라는 생각을 종종 하곤 했습니다. 그래서 이번 프로젝트에 위와 같은 생각을 구현할 방법으로 `딥러닝`을 떠올리게 되었고 조사하게 되었습니다.
그래서 프로젝트의 목표를 특정 손 모양을 웹캠에 인식시켜 허공에서 그림을 그리고 다른 사용자와 같이 즐길 수 있는 그림판을 구현하는 것이 되었습니다.

# Challenges

## 1. 어떻게 허공에서 손을 움직이는 것으로 그림을 그릴것인가?

### 1) 손 모양 인식 Library, tensorflow.js vs mediapipe

손 모양을 인식하려면 인공지능으로 학습된 모델을 가지고 있는 Library를 찾아야 했습니다. 조사 결과 tensorflow의 tfjs-models와 구글에서 지원하는 mediapipe의 손모양 인식 모델이 있었습니다.

둘다 같은 동작을 하지만 두 가지를 육안으로 비교하여 보니 `mediapipe`를 사용하는것이 `tensorflow.js`를 사용하는 것보다 부드러웠고, 개발하는 입장으로써 mediapipe가 더 좋은 문서와 설명을 제공했기때문에 mediapipe를 선택하게 되었습니다.

### 2) mediapipe의 출력값을 이용하여 canvas와 webcam과 동기화하기
#### mediapipe의 4가지 출력값
mediapipe의 gestureRecognizer는 출력값으로 아래와 같은 4가지 속성을 가진 객체를 반환합니다.
- gestures : 어떤 손 모양인지 알려주는 배열
- handednesses : 왼손인지 오른손인지 알려주는 배열
- landmarks : 2D 공간에서 손을 21개의 좌표로 표현한 배열
- worldLandmarks : 3D 공간에서 손을 21개의 좌표로 표현한 배열

위 4가지 속성 중 worldLandmarks를 제외한 3가지 속성을 이용하여 웹상에 도형과 같은 그래픽적인 것을 표현할 때 쓰이는 HTML 태그인 `<canvas>`를 사용하여 기능을 구현하였습니다.

기능 중 그리기 기능을 구현하는 부분에서 어려웠던 점은 landmarks의 배열은 x와 y 좌표를 가지고 있는데 이 값은 0~1 사이의 값을 반환하는데 이 값을 사용하여 어떻게 canvas에 그림을 표현해야 하는지가 어려운 부분이었습니다.
<br>

#### 손의 위치를 webcam에서 상대적으로 표현한 반환값, 0과 1

손을 움직이면서 1이라는 값이 웹캠에서의 width와 height의 값을 상대적으로 뜻한다는 것을 파악했습니다. 이 값에 canvas의 가로와 세로 길이를 곱하고 canvas 메서드를 사용하여 그리게 되면 canvas와 webcam의 손 위치가 `동기화`되는 것을 확인했고 문제를 해결했습니다.

### 3) 그리기 중 모드 변경 시 선 전체가 영향을 받는 문제

#### 그리기 중 색 변경, 굵기 변경 시 그리고 있는 선이 바뀌는 현상 발생

오른손에 그리기 모드와 왼손에 색 변경, 굵기 변경 기능을 구현 후 선을 그리면서 색을 바꿔보는 동작을 진행했습니다. 그리기 모드로 선을 그리는 중 색 변경이나 굵기 변경 기능을 사용하면 그리고 있던 선의 색과 굵기가 모두 바뀌는 현상이 있었습니다.
<br>

#### 원인 분석

- 기존의 canvas 메서드인 lineTo 메서드를 이어나가는 방식이 문제
 
위 현상을 해결하기 위하여 원인을 분석해 보았습니다.
기존의 동작 방식은 `canvas API`의 시작점을 설정하는 `moveTo 메서드`로 시작하고 지정된 좌표로 선을 잇는 `lineTo 메서드`를 계속 호출하는 방식으로 선을 그었습니다. 이러한 동작 방식이 그림을 그리는 도중 선의 굵기나 색을 변경하게 되면 `moteTo 메서드`의 좌표부터 그림을 그리고 있는 `lineTo 메서드`의 좌표까지 영향을 미치게 된다는 것으로 파악하였습니다.
<br>
> 해결 방안

-  이전 좌표를 기억하고 `moveTo 메서드`와 `lineTo 메서드`를 반복하는 방식으로 해결

기존에 마우스로 그림판을 구현하는 로직은 위와 같은 작동 방식으로 하였지만, 그리는 동시에 굵기와 색을 조절하는 경우가 없어 위와 같은 현상이 있을 것이라 예상하지 못했습니다.
위와 같은 동작을 해결하기 위해 `moveTo 메서드`로 시작점을 찍고 `lineTo 메서드`로 선을 계속해서 잇는 방식이 아닌 손 모양을 인식하는 루프마다 좌표를 저장하고 이전좌표를 잇는 방식으로 변경하여 이 문제를 해결했습니다.

## 2. 어떻게 여러명이서 그림을 그릴 수 있을까?

### 1) socket.io를 사용한 멀티 구현

여려 명이 동시에 그림을 그리는 방법으로 최적화된 양방향 통신을 지원하는 `socket.io`를 사용하여 실시간으로 데이터를 주고받는 방식으로 구현하는 것을 목표로 했습니다.

#### `broadcast 방식`으로 멀티 그림판 구현

웹캠으로 손 모양을 인식한 객체 데이터와 접속한 room의 방제목을 `socket.io`를 이용하여 서버로 보내고 서버에서 room에 접속한 모든 사용자에게 데이터를 보내는 `broadcast 방식`으로 객체 데이터를 보내는 방식으로 구현하였습니다. 그리고 받은 객체 데이터를 다시 방에 입장한 사용자의 canvas에 그리는 방식으로 `socket.io`를 사용한 멀티 그림판 구현을 완료하게 되었습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/bb566df8-f18a-42be-b084-e7f2fc8cf599"  width="400" height="300"/>

### 2) 2명이서 동시에 그릴 때 각 사용자의 선이 이어지는 경우

#### 같은 함수 재사용으로 여려 명의 사용자 접속 시 발생하는 각 사용자의 커서에 선이 이어지는 현상 발생

`socket.io`를 이용하여 실시간 통신을 하여 그림을 그리는 것까지는 성공하였으나 여러 명의 사용자가 동시에 그림을 그리게 된다면 각 사용자의 커서가 선이 서로 이어지는 현상이 있었습니다.

#### 원인 분석

1. lineTo 메소드 반복
2. 함수 재사용으로 인한 다른 사용자 좌표 기억

[1.3](#3-그리기-중-모드-변경-시-선-전체가-영향을-받는-문제)의 문제와 마찬가지로 `lineTo 메서드`를 반복하여 그림을 그리는 방식으로 동작하면서발생하는 문제였습니다. 그래서 이전 좌표를 기억하여 `moveTo`와 `lineTo` 메소드를 반복하여 그리는 방식으로 동작을 바꾸어 해결하려 했으나 이전 좌표가 공유되어 그림이 이상하게 그려지는 현상은 그대로였습니다. 이는 함수를 재활용하면서 사용하다 보니 다른 사용자의 좌표를 기억하여 발생하는 문제였습니다.

#### 고려한 두 가지 방법

그래서 저는 해결할 수 있는 두 가지 방법을 생각했습니다.

1. 사용자 늘어날 때마다 canvas에 고유 id를 부여하여 겹치는 방식
- 장점 : 사용자가 늘어날때마다 id를 부여한 canvas를 늘리면 됨(구현 쉬움)
- 단점 : z-index 문제로 겹쳐 그리기, 상대방 그림 지우기 불가 / 여러 canvas사용
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/92308ca3-73cf-46ce-b2a4-c9778c90f981"  width="400" height="300"/>

2. 이전 좌표에 socket id를 기억하여 저장하는 방식
- 장점 : 한 canvas안에서 모든 사용자의 그리기, 지우기 해결 가능

```js
prevPosition = { ...prevPosition, [socketId]: { x, y } };
```

#### 해결 방안
- 이전 좌표에 socket id를 기억하여 저장하는 방식 선택

첫 번째 방법은 각 canvas에 각 사용자가 할당되기 때문에 `canvas`의 우선순위인 `z-index`의 문제가 발생하여 그림을 서로 겹쳐 그릴 수 없거나 서로의 그림을 지울 수 없는 문제가 있었습니다. 그래서 한 canvas에 모든 문제를 해결해야 한다고 생각하고 두 번째 방법인 이전 좌표에 `socket id`를 기억하여 저장하는 방식으로 진행하는 방식이 단점없이 해결 가능하여 이 방법으로 해결했습니다.

### 3) 그림을 그리고 있는 방 입장 시 어떻게 그리고 있던 그림을 불러올 것인가?

#### 준비/시작 기능 없는 자유로운 참가 방식 선택

처음에는 준비/시작 기능을 만들어 진행 중인 방에는 참가가 불가능하게 구현 예정이었습니다. 하지만 언제든지 그림을 그리고 있는 방에 자유롭게 접속하고 나갈 수 있게 구현하는 방식이 이 프로젝트에서 더 옳은 방향이라고 생각하였습니다. 그래서 진행 중인 방에 그림을 불러오게 할 방법을 고민했습니다.

#### redux를 사용하여 방 입장 시 동기화 기능 구현 목표 설정

제가 생각한 방법은 `redux`를 사용하여 사용자가 그린 정보를 저장한 뒤 새로운 사용자가 들어오게 된다면 그 정보를 요청하고 전달받아 기존의 그림을 그려주는 방향으로 목표를 잡고 진행하였습니다.

#### 고려해야 할 두 가지 문제

1. 누구의 정보를 가져와야 할까?
2. 어떻게 기존 함수 로직을 재활용하면서 구현?

이 부분에서 어려웠던 점은 같은 `socket.io`의 `room`에 있는 누구의 정보를 가져와야 하는지 문제가 되었고, `redux` 설계를 어떤 방식으로 해야지 기존의 함수를 재활용하면서 구현할 수 있을까에 대한 문제가 있었습니다. 그래서 저는 두 가지 방식의 해결 방안을 생각했습니다.

#### 해결 방안

1. 가장 방에 오래 있었던 사용자의 그림 데이터를 요청하여 초기화하기
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/b85d323e-6590-4f5c-975a-d91ad93ce174"  width="400" height="600"/>

2. redux 데이터 구조를 사용자의 socket id마다 정보를 가지고 있는 방식

- 가장 방에 오래 있었던 사용자의 그림 데이터를 요청하여 초기화하기 선택

첫 번째 방식을 설명하자면 각 사용자의 행동과 다른 사용자들의 행동을 모두 `redux`에 저장합니다. 그리고 방에 사용자가 입장하게 되면 그 사용자는 첫 번째 사용자의 `redux` 데이터를 요청하면서 데이터를 저장하게 되고 순서대로 그림을 그려 `동기화`하는 방식입니다.

두 번째는 `redux`의 `데이터 구조`를 `socket id`마다 정보를 가지고 있는 방식으로 구현하려고 했습니다. 하지만 이 방식을 사용하면 그려진 시간이 알 수 없게 되어 원래의 그림 정보와 다르게 표시될 가능성이 있었습니다. 이를 방지하기 위하여 하나의 배열에 시간순으로 정보를 넣고 그 정보를 다시 함수를 재활용하여 그리는 첫 번째 방식으로 구현하였습니다.

## 3. UX 개선

### 1) 일정 시간 후 커서 사라지게 만들기
#### 많은 커서 불편함 해소를 위한 5초 지나면 커서 사라지는 기능 구현

여러 명의 사용자가 방에 들어와서 그림을 그리게 되고 사용자가 많아지면 여러 개의 커서가 생기게 됩니다. 그렇게 되면 사용자가 잠시 그림을 그리는 것을 쉬게 되더라도 커서는 화면 위에 표시되게 됩니다. 그 부분이 사용자 입장에서 불편할 수 있는 부분이라 생각했습니다. 움직임이 없는 상태로 5초가 지나게 되면 커서를 보이지 않게 만드는 기능을 [Redux에서 count 상태를 관리](https://github.com/MotionDraw/MotionDraw-Client/blob/f0008a75ca7b9681855fa13ad06d1702c4e7b698/src/features/history/cursorSlice.js#L4) 하여 구현했습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/324f5343-58a8-4b4a-ac3a-47e9a9cba45c"  width="400" height="300"/>

### 2) 마우스로 선굵기 조절 및 색 선택 기능
#### 손 모양으로 모드 변경 소요 시간 단축을 위한 마우스를 사용한 모드 변경

그림을 그리다가 손 모양으로 선 굵기를 조절하거나 색을 선택하는 것에 답답함을 느낄 사용자도 있으리라 생각했습니다. 그래서 드래그로 선 굵기를 조절하고 마우스 클릭으로 색 선택을 할 수 있게 만들어 빠른 변환이 가능한 기능을 구현하게 되었습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/1ce86ca8-3b03-44f3-860b-3c231b418403"  width="400" height="300"/>

### 3) 모드 변경 및 색 변경 시 커서에 progress bar 구현
#### 모드 변경 소요 시간 시각화

굵기를 조절하기 다음 색으로 넘어가기 기능 등 다른 모드로 변경되는 데 시간이 걸리는 기능들이 있었습니다. 하지만 사용자가 모드가 변경되는데 시간이 얼마나 소요되는지 모른다면 불편하리라 생각했습니다. 그래서 시간 관리를 [Redux의 count 상태](https://github.com/MotionDraw/MotionDraw-Client/blob/f0008a75ca7b9681855fa13ad06d1702c4e7b698/src/features/history/cursorSlice.js#L4)를 불러와서 커서에 모드 변경 진행 정도를 표시해주는 `progress bar` 기능을 추가하여 구현하였습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/cdf3d4b2-0dfc-44e1-a74e-1483288f7fc9"  width="400" height="300"/>

### 4) 색상에 마우스 올릴 시 색 변경 기능
#### 실제 팔레트와 유사한 느낌을 위한 기능 추가

사용자가 마우스로 굵기 변경이나 색 변경 모드로 색을 바꾸는 방식이 아닌 팔레트에 붓을 찍어서 그림을 구현하는 방식처럼 마우스를 색에 올릴 시 그 색을 사용하도록 한다면 사용하기 편할 것이라고 생각하였습니다. 그래서 마우스를 색에 올리면 색이 변경하는 기능을 구현하였습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/949fd312-7fc9-4470-ac5f-c425c515e397"  width="400" height="300"/>

## 4. 성능 개선 방향

### 1) 어떻게 해야 그림을 더 부드럽게 그릴 수 있을까?
#### 개발자 도구의 Performance탭을 사용하여 성능 분석

그림 그릴 때 가끔 화면이 버벅이는 것처럼 느껴지는 이유를 조사해 봤습니다. 브라우저는 한 프레임당 16.67ms 1초에 60번의 프레임을 보여주는 식으로 동작합니다. 하지만 손 모양을 인식하고 그림을 그리는 함수의 실행시간이 약 50ms에서 100ms 사이로 동작하는 것을 개발자 도구의 Performance 측정으로 알아냈습니다. 함수에서 대부분의 시간은 MediaPipe에서 손 모양을 인식하는 함수에서 소요되는 것으로 파악됐습니다.

#### 개선 방향 두 가지

1. MediaPipe 함수 실행시간 단축
2. setTimeout에서 requestAnimationFrame으로 변경

#### renderLoop 함수 내부에서 외부 함수가 두번 호출되는 현상 파악

첫번째 개선 방향으로는 MediaPipe에서 실행시간이 약 25ms인 내부 함수가 두번씩 호출되어 함수의 실행시간이 늘어나는 현상을 발견하였습니다. 브라우저에서 한 프레임을 표현하는 16.67ms보다 손 모양 인식 함수의 길이가 더 길기만 이는 외부 라이브러리를 사용하고 있는 개발자가 조절하지 못한다고 판단하였습니다. 그래서 함수 실행시간을 단축하지 못하더라도 똑같은 함수가 두 번 호출되는 현상을 파악하여 막을 수 있는 방식을 알아낸다면 성능을 개선할 수 있을 것으로 생각합니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/b27e576c-94f9-4eeb-842b-d4ebbcc4ced4"  width="400" height="300"/>
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/00b63048-9275-4941-8bb3-f2a8b1e3cb96"  width="400" height="300"/>

#### setInterval 방식에서 rAF(requestAnimationFrame) 방식으로 변경

두번째 성능 개선 방향은 `setInterval` 동작방식과 `rAF(requestAnimationFrame)`의 동작 방식과 장단점을 비교했을 때 `rAF`로 동작하는 방식이 브라우저에 최적화되어 효율적인 애니메이션을 구현할 것이라 예상하였습니다.

|setInterval|차이점|rAF|
|:-:|:-:|:-:|
|delay 인자|초당 호출 횟수|자동|
|실행 O|백그라운드|실행 X|
|인자에 func,delay 설정|실행 방식|callback 내부에서 rAF 재호출|
|리페인트 후|Task의 위치|리페인트 전|
|Macro 큐|큐|Animation frames 큐|

<p>
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/c2572015-aa99-43bd-a189-c593bdb21fcc"  width="400" height="300"/>
  <br>
  <em>JSConf, Jake Archibald: In the Loop의 setTimeout</em>
</p>
<p>
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/6f07344e-ca0e-4577-bb23-7d9999711af9"  width="400" height="300"/>
  <br>
  <em>JSConf,Jake Archibald: In the Loop의 requestAnimationFrame</em>
</p>

#### 끊기면서 작동하는 rAF

```js
  useEffect(() => {
    ...
    // 기타 코드
    
    function renderLoop() {
      ...
      // 손 모양 인식 및 그리기 코드
    }
    
    const id = setInterval(() => {
      renderLoop();
    }, 17);
     
     
    return () => {
      clearInterval(id);
    };
    }, [dependency]);
```

```js
  useEffect(() => {
    ...
    // 기타 코드
    
    function renderLoop() {
      ...
      // 손 모양 인식 및 그리기 코드
      
      requestAnimationFrame(renderLoop);
    }
    
    const id = requestAnimationFrame(renderLoop);
     
    return () => {
      cancelAnimationFrame(id);
    };
    }, [dependency]);
```

실제로 두 가지 방법을 모두 사용해 보았을 때 예상과는 달리 제 코드에서는 `rAF`는 그림이 끊기면서 그려지고 `setInterval` 방식이 끊기지 않게 그려지는 상황이 일어났습니다.

#### 원인 추측

1. rAF가 동작하면서 callback 함수가 한 프레임의 길이인 16.67ms보다 길어서 중간에 frame drop이 일어났을 것이다.
2. `useEffect`에서 rAF 요청을 멈추는 `cancelAnimationFrame`에 id 전달 관련 문제일 것이다.

#### 첫번쨰 추측, rAF의 frame drop 현상 예상

rAF가 동작하면서 callback 함수가 한 프레임의 길이인 16.67ms보다 길어서 중간에 frame drop이 일어났을 것이라고 생각했습니다.
하지만 많은 조사를 통해 setInterval의 방식은 이전 callback 함수의 실행 시간과 상관없이 일정한 간격으로 다음 콜백함수를 예약하기 때문에 콜백함수가 지연되고 프라임이 누락되는 현상이 발생할 수 있고, rAF는 브라우저의 최적의 타이밍으로 애니메이션을 업데이트 하기 때문에 프레임이 누락되는 현상이 적다는 내용이었습니다. 실제로 각각의 방식을 같은 시간 측정하니 setInterval 방식이 frame drop이 발생하고 rAF 방식은 frame drop이 발생하지 않았습니다.

#### 두번째 추측, rAF의 id 전달 관련 문제

```js
  ...
  ...
  const requestRef = useRef(null); // useRef로 id 관리
  
  useEffect(() => {
    ...
    // 기타 코드
    
    function renderLoop() {
      ...
      // 손 모양 인식 및 그리기 코드
      
      requestRef.current = requestAnimationFrame(renderLoop);
    }
    
    requestRef.current = requestAnimationFrame(renderLoop);
     
    return () => {
      cancelAnimationFrame(id);
    };
    }, [dependency]);
```

#### rAF 사용시 끊기는 원인은 `cancelAnimationFrame` 메서드에 잘못된 갱신되지 않은 id 전달

첫번째 추측이 틀렸을 수 있다는 점을 깨닫고 다시 rAF를 사용한 코드를 살펴보았습니다. rAF의 동작 방식은 requestAnimationFrame을 호출하면 renderLoop를 호출하게되고 rederLoop가 호출되면 다시 requestAnimationFrame를 호출하여 계속해서 루프가 돌게되어 애니메이션이 구현되는 방식입니다. 그렇다면 cancelAnimationFrame를 사용하려면 rAF의 id가 필요하게 되는데 기존 코드는 id를 갱신하지 않고 초기 id를 cancelAnimationFrame의 인자로 넣은게 문제였습니다. 그래서 컴포넌트 상단에 useRef를 사용하여 id를 관리하여 이 문제를 해결하였습니다.

#### cancelAnimationFrame이 호출되지 않으면 애니메이션이 끊기게 되는 이유는 rAF의 중첩

React에서 의존성 배열이 바뀌는데 cancelAnimationFrame이 호출되지 않으면 메모리나 CPU사용에 영향을 끼칠것이라 추측하였습니다. 그래서 개발자 도구의 Performance 탭을 이용하여 Task에 여러 개의 rAF가 중첩되는 문제가 생겼습니다. 그래서 똑같은 callback 함수가 한번에 겹쳐서 실행되어 브라우저의 성능이 느려지고 선이 끊겨서 그려지는 것이라고 판단하였습니다. 그리고 의존성 배열이 바뀌지 않는 상황이 발생하면 정상화 되는 결과도 관측하였습니다.

<p>
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/9d2bb89b-32c9-4009-90ea-cd42409cfb47"  width="600" height="300"/>
  <br>
  <em>의존성 배열이 바뀌는 상황, 중첩된 rAF</em>
</p>
<p>
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/6115d2e5-a354-4a1b-84a6-525aff5904ce"  width="400" height="300"/>
  <br>
  <em>의존성 배열이 바뀌지 않는 상황, 정상적으로 호출되는 rAF</em>
</p>

### 2) Custom Hook을 만들어 코드 최적화
#### 커서 기능에서 발생한 중복 로직
[5초가 지나면 커서가 사라지는 기능](#1-일정-시간-후-커서-사라지게-만들기)을 구현하면서 아래와 같은 로직을 발견하였습니다.

```js
  const [invisibleCount, setInvisibleCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      if (invisibleCount > 0) {
        setInvisibleCount((count) => count - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [invisibleCount]);

  useEffect(() => {
    setInvisibleCount(5);
  }, [cursor]);
```

카운트 다운 로직이 MyCursor 컴포넌트와 OthersCursor 컴포넌트가 서로 중복해서 사용되었다는 점을 파악하고 코드의 재사용성과 가독성, 추상화를 위하여 Custom Hook으로 만들어 관리하였습니다.

```js
export function useCursorDisappearCount(timerDuration, cursorPosition) {
  const [cursorDisappearCount, setCursorDisappearCount] =
    useState(timerDuration);

  useEffect(() => {
    const countIntervalId = setInterval(() => {
      if (cursorDisappearCount > 0) {
        setCursorDisappearCount((count) => count - 1);
      }
    }, 1000);

    return () => clearInterval(countIntervalId);
  }, [cursorDisappearCount]);

  useEffect(() => {
    setCursorDisappearCount(timerDuration);
  }, [cursorPosition, timerDuration]);

  return cursorDisappearCount;
}
```

컴포넌트 이름과 변수 값을 더욱 명시적으로 작성하여 코드를 유지보수하기 편하게 변경하였습니다.

# Feature
## 1. 커서 기능
사용자의 왼손, 오른손 검지 위치를 표시 해 주는 커서 기능을 구현하였습니다.

<details>
<summary>커서 기능</summary>
<div>       
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/92b13c8a-3058-48a4-91bc-a061aed2d315" alt"커서기능" width="400" height="300"/>
</div>
</details>

## 2. 이동 기능
사용자가 오른손을 움직일 때 주먹 펴기 상태로 움직이면 그림이 그려지거나 지워지지 않게 이동할 수 있습니다.

<details>
<summary>이동 기능</summary>
<div>       
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/c1d89d4f-a905-4575-95c8-c82c272501c0" alt"이동기능" width="400" height="300"/>
</div>
</details>

## 3. 그리기 기능
사용자가 이동, 그리기, 지우기 모드를 자유롭게 변경하기 위해서는 검지 올리기 손동작으로는 부족함을 느꼈습니다.
<br/>
그래서 사용자의 오른손 손모양을 주먹 펴기 상태, V 포즈를 제외한 모든 손 모양은 그리기 모드로 동작하게 구현했습니다.

<details>
<summary>그리기 기능</summary>
<div>       
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/26eebf8b-7157-4047-a0e3-fc7de2163d0c" alt"그리기기능" width="400" height="300"/>
</div>
</details>

## 4. 지우기 기능
사용자가 오른손 손모양을 V포즈를 유지한 상태로 움직이게 된다면 지우기 모드가 동작합니다.

<details>
<summary>지우기 기능</summary>
<div>       
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/84a0f3ee-5f12-43be-81ad-bd33530bde37" alt"지우기기능" width="400" height="300"/>
</div>
</details>

## 5. 선 굵기 조절 기능
사용자가 왼손 손 모양을 주먹 펴기를 한다면 선 굵기가 굵어지고, 주먹 쥐기를 한다면 선 굵기가 얇아지는 기능입니다.

<details>
<summary>선 굵기 조절 기능</summary>
<div>       
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/91542c7c-0bf4-43f0-8b7b-993af5c74995" alt"선 굵기 조절 기능" width="400" height="300"/>
</div>
</details>

## 6. 색 변경 기능
사용자가 왼손 손 모양을 엄지 올리기를 한다면 다음 색으로 변경되고, 엄지 내리기를 한다면 이전 색으로 변경되는 기능입니다.

<details>
<summary>선 굵기 조절 기능</summary>
<div>       
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/4d4b9e80-6c77-48e0-ba81-4f56181df07f" alt"선 굵기 조절 기능" width="400" height="300"/>
</div>
</details>

## 7. 마우스를 통한 굵기 변경 기능
마우스로 바를 움직여서 굵기를 조절하는 기능입니다.

<details>
<summary>마우스를 통한 굵기 변경 기능</summary>
<div>       
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/8536d501-9f01-443c-9773-d40d02d6384d" alt"마우스 굵기 변경 기능" width="400" height="300"/>
</div>
</details>

## 8. 마우스를 통한 색 변경 기능
마우스로 원을 클릭하여 색을 변경할 수 있는 기능입니다.

<details>
<summary>마우스를 통한 색 변경 기능</summary>
<div>       
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/84101ae2-082d-43cb-9ddc-3eeb5021deab" alt"마우스 색 변경 기능" width="400" height="300"/>
</div>
</details>

## 9. 도형 미리보기 기능
왼손으로 사랑해 포즈를 한 상태로 오른손을 사랑해포즈, 검지 올리기, V포즈를 조합하면 선 긋기, 원그리기, 사각형 도형 선택 기능이 됩니다.
<br/>
도형 미리보기 기능을 통해 canvasAPI에 어떤 도형이 그려질지 예상할 수 있는 기능입니다.

<details>
<summary>도형 미리보기 기능</summary>
<div>       
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/1e78f4a6-87ee-4832-b09e-5ea6d33bf763" alt"도형 미리보기 기능" width="400" height="300"/>
</div>
</details>

## 10. 도형 그리기 기능
왼손으로 사랑해 포즈를 한 상태로 오른손을 사랑해포즈, 검지 올리기, V포즈를 조합하면 선 긋기, 원그리기, 사각형 도형 선택 기능이 됩니다.
<br/>
도형 선택 기능에서 왼손의 사랑새 포즈를 유지한 상태로 오른손을 주먹펴기 상태로 바꾼다면 도형이 그려지는 기능입니다.

<details>
<summary>도형 그리기 기능</summary>
<div>       
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/162a5046-3ec0-4a79-baa7-694cebba404e" alt"도형 그리기 기능" width="400" height="300"/>
</div>
</details>

## 11. 모드 변경 표시 기능
현재 모드가 무엇인지 화면에 나타나는 기능입니다.

<details>
<summary>모드 변경 표시 기능</summary>
<div>
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/87768786-9d15-4030-b758-6045784a4ff9" alt"모드 변경 표시 기능" width="400" height="300"/>
</div>
</details>

## 12. 설명 모달창
웹 애플리케이션을 어떻게 이용해야 하는지 설명해주는 모달창입니다.

<details>
<summary>설명 모달창</summary>
<div>
  <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/d8bd8a0a-7630-448f-a81d-d63ced7f2376" alt"설명 모달창" width="400" height="300"/>
</div>
</details>

## 13. 멀티 방 생성 기능
멀티 방에 생성하면서 입장 가능한 기능입니다.

<details>
<summary>멀티 방 생성 기능</summary>
<div>
    <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/6e4fa7fc-6fa3-4d64-8649-e856b6487c89" alt"방 생성 기능" width="400" height="300"/>
</div>
</details>

## 14. 멀티 방 입장 기능 및 그림 불러오기 기능
멀티 방에 입장하여 다른 사용자와 같이 그림을 그릴 수 있는 기능과 입장 시 다른 사용자가 그리던 그림을 불러오는 기능입니다.

<details>
<summary>멀티 방 입장 기능 및 그림 불러오기 기능</summary>
<div>
    <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/f1cffa65-5d42-4dc5-a525-f478a53137aa" alt"입장 및 그림 불러오기 기능" width="400" height="300"/>
</div>
</details>

## 15. 멀티 방 새로고침/자동 새로고침 기능
로비에서 생성 된 멀티방 정보를 불러오는 새로고침 기능과, 5초마다 한번씩 자동으로 정보를 불러오는 자동 새로고침 기능입니다.

<details>
<summary>멀티 방 새로고침/자동 새로고침 기능</summary>
<div>
    <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/64085f8f-c35a-489f-9f03-1cbee74e1445" alt"방 새로고침 기능" width="400" height="300"/>
    <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/fb74050c-f7be-486f-95ce-aad0e6b1f9c0" alt"방 자동 새로고침 기능" width="400" height="300"/>
</div>
</details>

## 16. 멀티 플레이 기능
멀티 방에 입장하여 다른 사용자들과 그림을 그릴 수 있는 기능입니다.

<details>
<summary>멀티 플레이 기능</summary>
<div>
    <img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/1a259ed7-7ec8-459c-95bc-aff858b23bdb" alt"멀티 플레이 기능" width="400" height="300"/>
</div>
</details>

# Schedule

### 프로젝트 기간 : 2023.04.03(월) ~ 2023.04.24(금) / 3주

1주차 : 기획 및 설계

- 아이디어 수집
- 기술 스택 선정
- Figma를 사용한 Mockup 제작
- Notion에 Kanban 작성

2~3주차 : 기능 개발

- 프론트 엔드 구현
- 백엔드 서버 구현

# Tech Stacks

### Frontend

- React
- React-Router
- Redux-Toolkit
- styled-component
- socket.io-client
- ESLint

### Backend

- Node.js
- Express
- socket.io
- ESLint

# Repository Link

- [Frontend](https://github.com/MotionDraw/MotionDraw-Client)
- [Backend](https://github.com/MotionDraw/MotionDraw-Server)

# Member

- 강현준 : steady.kang27@gmail.com
