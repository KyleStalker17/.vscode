from collections.abc import Callable, Generator
from typing import Pattern, TypeVar
from typing_extensions import TypeAlias
from xml.etree.ElementTree import Element

xpath_tokenizer_re: Pattern[str]

_token: TypeAlias = tuple[str, str]
_next: TypeAlias = Callable[[], _token]
_callback: TypeAlias = Callable[[_SelectorContext, list[Element]], Generator[Element, None, None]]

def xpath_tokenizer(pattern: str, namespaces: dict[str, str] | None = ...) -> Generator[_token, None, None]: ...
def get_parent_map(context: _SelectorContext) -> dict[Element, Element]: ...
def prepare_child(next: _next, token: _token) -> _callback: ...
def prepare_star(next: _next, token: _token) -> _callback: ...
def prepare_self(next: _next, token: _token) -> _callback: ...
def prepare_descendant(next: _next, token: _token) -> _callback: ...
def prepare_parent(next: _next, token: _token) -> _callback: ...
def prepare_predicate(next: _next, token: _token) -> _callback: ...

ops: dict[str, Callable[[_next, _token], _callback]]

class _SelectorContext:
    parent_map: dict[Element, Element] | None
    root: Element
    def __init__(self, root: Element) -> None: ...

_T = TypeVar("_T")

def iterfind(elem: Element, path: str, namespaces: dict[str, str] | None = ...) -> Generator[Element, None, None]: ...
def find(elem: Element, path: str, namespaces: dict[str, str] | None = ...) -> Element | None: ...
def findall(elem: Element, path: str, namespaces: dict[str, str] | None = ...) -> list[Element]: ...
def findtext(elem: Element, path: str, default: _T | None = ..., namespaces: dict[str, str] | None = ...) -> _T | str: ...