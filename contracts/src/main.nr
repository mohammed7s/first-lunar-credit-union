contract Main {
    pub fn double(x: Field) -> pub Field { x * 2 }
    pub fn triple(x: Field) ->  pub Field { x * 3 }
    pub fn quadruple(x: Field) -> pub Field { double(double(x)) }
}
