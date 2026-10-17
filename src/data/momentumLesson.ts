export type MomentumQuizTopic = 'Momentum' | 'Impulse' | 'Graphs' | 'Conservation' | 'Collisions';

export interface ChoiceQuestion {
  type: 'choice';
  topic: MomentumQuizTopic;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface NumericQuestion {
  type: 'numeric';
  topic: MomentumQuizTopic;
  prompt: string;
  answer: number;
  tolerance: number;
  unit: string;
  explanation: string;
}

export type MomentumQuestion = ChoiceQuestion | NumericQuestion;

export const momentumQuestions: MomentumQuestion[] = [
  {type:'choice',topic:'Momentum',prompt:'Which equation defines linear momentum?',choices:['p = mv','p = ma','p = ½mv²','p = F/t'],answer:'p = mv',explanation:'Linear momentum is mass multiplied by velocity, p = mv.'},
  {type:'choice',topic:'Momentum',prompt:'Why is momentum a vector?',choices:['Mass is a vector','Velocity has direction','It is measured in newtons','It is always negative'],answer:'Velocity has direction',explanation:'Mass is scalar, but velocity is a vector. Their product has the direction of velocity.'},
  {type:'numeric',topic:'Momentum',prompt:'Find the momentum of a 2.0 kg object moving at +3.0 m/s.',answer:6,tolerance:0.02,unit:'kg m/s',explanation:'p = mv = (2.0 kg)(+3.0 m/s) = +6.0 kg m/s.'},
  {type:'choice',topic:'Momentum',prompt:'A 4 kg object moves left at 5 m/s. If right is positive, what is its momentum?',choices:['+20 kg m/s','−20 kg m/s','+0.8 kg m/s','−0.8 kg m/s'],answer:'−20 kg m/s',explanation:'Left is negative, so p = 4(−5) = −20 kg m/s.'},
  {type:'choice',topic:'Momentum',prompt:'Two objects have equal momentum magnitude. Which must be true?',choices:['They have equal mass','They have equal speed','Their mass times speed magnitudes are equal','They move in the same direction'],answer:'Their mass times speed magnitudes are equal',explanation:'Momentum magnitude is mv. Different masses and speeds can give the same product.'},
  {type:'numeric',topic:'Momentum',prompt:'A 1 200 kg car moves at 15 m/s. Give the magnitude of its momentum.',answer:18000,tolerance:10,unit:'kg m/s',explanation:'|p| = mv = 1 200 × 15 = 18 000 kg m/s.'},
  {type:'choice',topic:'Momentum',prompt:'A stationary object has what linear momentum?',choices:['Zero','Its mass in kg','Its weight','An undefined value'],answer:'Zero',explanation:'With v = 0, p = mv = 0 for any finite mass.'},
  {type:'choice',topic:'Momentum',prompt:'Which unit is equivalent to kg m/s?',choices:['N s','J/s','N/m','kg m/s²'],answer:'N s',explanation:'Since 1 N = 1 kg m/s², multiplying by seconds gives N s = kg m/s.'},
  {type:'choice',topic:'Momentum',prompt:'A 0.15 kg ball travels at 20 m/s east. Which is its momentum magnitude?',choices:['3.0 kg m/s','0.0075 kg m/s','133 kg m/s','20.15 kg m/s'],answer:'3.0 kg m/s',explanation:'The magnitude is mv = 0.15 × 20 = 3.0 kg m/s.'},
  {type:'numeric',topic:'Momentum',prompt:'A 0.50 kg cart moves at −4.0 m/s. Find its signed momentum.',answer:-2,tolerance:0.01,unit:'kg m/s',explanation:'p = 0.50 kg × (−4.0 m/s) = −2.0 kg m/s.'},
  {type:'choice',topic:'Momentum',prompt:'A truck and bicycle move at the same speed. Which has greater momentum?',choices:['The truck, because its mass is greater','The bicycle, because its wheels are smaller','They have equal momentum','Cannot compare without their directions'],answer:'The truck, because its mass is greater',explanation:'At the same velocity, p = mv, so the greater mass has greater momentum magnitude.'},
  {type:'choice',topic:'Momentum',prompt:'A 2 kg object at +6 m/s and a 6 kg object at +2 m/s have what relationship?',choices:['The first has three times the momentum','The second has three times the momentum','Their momenta are equal','Their momenta are opposite'],answer:'Their momenta are equal',explanation:'Both have p = +12 kg m/s.'},
  {type:'choice',topic:'Impulse',prompt:'What is impulse for a constant net force?',choices:['J = F Δt','J = F/Δt','J = mv²','J = m/t'],answer:'J = F Δt',explanation:'A constant net force acting for a time interval produces impulse J = FΔt.'},
  {type:'choice',topic:'Impulse',prompt:'State the impulse momentum theorem.',choices:['Net impulse equals change in momentum','Impulse equals final momentum only','Force equals momentum','Momentum equals force times distance'],answer:'Net impulse equals change in momentum',explanation:'Jnet = Δp = pf − pi.'},
  {type:'numeric',topic:'Impulse',prompt:'A constant 12 N net force acts for 0.50 s. Find the impulse.',answer:6,tolerance:0.02,unit:'N s',explanation:'J = FΔt = 12 × 0.50 = 6.0 N s.'},
  {type:'choice',topic:'Impulse',prompt:'A 0.20 kg ball moving at +10 m/s is caught and brought to rest. What is its change in momentum?',choices:['−2.0 kg m/s','+2.0 kg m/s','−0.20 kg m/s','0 kg m/s'],answer:'−2.0 kg m/s',explanation:'Δp = pf − pi = 0 − (0.20 × 10) = −2.0 kg m/s.'},
  {type:'numeric',topic:'Impulse',prompt:'A 0.15 kg ball changes velocity from −8 m/s to +12 m/s. Find the impulse.',answer:3,tolerance:0.02,unit:'N s',explanation:'J = Δp = m(vf − vi) = 0.15[12 − (−8)] = 3.0 N s.'},
  {type:'choice',topic:'Impulse',prompt:'For the same momentum change, what happens to average net force if contact time doubles?',choices:['It halves','It doubles','It stays the same','It becomes zero'],answer:'It halves',explanation:'Favg = Δp/Δt. Doubling the time halves average force for the same impulse.'},
  {type:'choice',topic:'Impulse',prompt:'A force acts for zero time. What impulse does this idealized force interval produce?',choices:['Zero for a finite force','Infinite for every force','Equal to the object mass','Equal to its kinetic energy'],answer:'Zero for a finite force',explanation:'For finite constant force, J = FΔt = 0 when Δt = 0.'},
  {type:'numeric',topic:'Impulse',prompt:'A 1.5 kg object changes velocity from +2 m/s to +10 m/s in 0.40 s. Find its average net force.',answer:30,tolerance:0.1,unit:'N',explanation:'Δp = 1.5(10 − 2) = 12 kg m/s. Favg = Δp/Δt = 12/0.40 = 30 N.'},
  {type:'choice',topic:'Impulse',prompt:'A person bends their knees when landing. Why does this reduce average force?',choices:['The stopping time increases for a similar momentum change','Their momentum becomes conserved by the floor','Their mass decreases','The impulse becomes larger automatically'],answer:'The stopping time increases for a similar momentum change',explanation:'For approximately the same Δp, a longer stopping time gives a smaller average force.'},
  {type:'choice',topic:'Impulse',prompt:'What is the area under a net force versus time graph?',choices:['Net impulse and change in momentum','Acceleration','Kinetic energy','Mass'],answer:'Net impulse and change in momentum',explanation:'The signed area ∫Fnet dt is impulse, which equals change in momentum.'},
  {type:'choice',topic:'Graphs',prompt:'A constant 8 N force acts for 3 s. What is the rectangular area under the force-time graph?',choices:['24 N s','11 N s','2.7 N s','24 N'],answer:'24 N s',explanation:'The rectangle area is height × width = 8 N × 3 s = 24 N s.'},
  {type:'choice',topic:'Graphs',prompt:'A force-time graph lies below the time axis. What does its signed area indicate?',choices:['Impulse opposite the chosen positive direction','Negative elapsed time','Negative mass','Zero impulse always'],answer:'Impulse opposite the chosen positive direction',explanation:'A force below the axis is negative in the selected coordinate system, so the signed impulse is negative.'},
  {type:'choice',topic:'Graphs',prompt:'A triangular force-time pulse has peak 10 N and duration 0.20 s. What is its impulse?',choices:['1.0 N s','2.0 N s','10 N s','50 N s'],answer:'1.0 N s',explanation:'Triangle area is ½ base × height = ½(0.20 s)(10 N) = 1.0 N s.'},
  {type:'choice',topic:'Graphs',prompt:'A rectangular force-time graph has height 5 N from 0 to 2 s. Its impulse is…',choices:['10 N s','7 N s','2.5 N s','0 N s'],answer:'10 N s',explanation:'Area = force × duration = 5 × 2 = 10 N s.'},
  {type:'choice',topic:'Graphs',prompt:'Which graph feature represents average force over an interval?',choices:['Impulse divided by the interval duration','The total time alone','The graph’s maximum time coordinate','The force-time area multiplied by time'],answer:'Impulse divided by the interval duration',explanation:'Favg = J/Δt, where J is the signed area under the force-time graph.'},
  {type:'choice',topic:'Graphs',prompt:'If positive force acts first and an equal negative impulse follows, what is the net impulse?',choices:['Zero','Always positive','Always negative','Twice either impulse'],answer:'Zero',explanation:'Equal and opposite signed areas cancel, giving zero net impulse and no net momentum change.'},
  {type:'numeric',topic:'Graphs',prompt:'A force rises linearly from 0 to 20 N over 0.50 s. Find the impulse.',answer:5,tolerance:0.02,unit:'N s',explanation:'The area is triangular: J = ½(20 N)(0.50 s) = 5.0 N s.'},
  {type:'choice',topic:'Graphs',prompt:'The force is 0 N for 2 s, then 4 N for 3 s. What is total impulse?',choices:['12 N s','6 N s','5 N s','24 N s'],answer:'12 N s',explanation:'Only the second interval contributes: J = 4 N × 3 s = 12 N s.'},
  {type:'choice',topic:'Graphs',prompt:'Why can the area under a force-time graph have units of momentum?',choices:['N s equals kg m/s','N s equals joules','N/s equals kg m/s','N m equals kg m/s'],answer:'N s equals kg m/s',explanation:'A newton is kg m/s², so N s = kg m/s, the unit of momentum.'},
  {type:'choice',topic:'Conservation',prompt:'When is total momentum of a system conserved?',choices:['When net external impulse on the system is zero','Whenever the objects collide','Only if kinetic energy is constant','Only when objects have equal mass'],answer:'When net external impulse on the system is zero',explanation:'Momentum conservation follows when the system is isolated or the net external impulse is zero over the interval.'},
  {type:'choice',topic:'Conservation',prompt:'Two objects collide. Which forces do not change total momentum of the two-object system?',choices:['Internal forces between the objects','External forces from the floor','Gravity from outside the system','Air resistance'],answer:'Internal forces between the objects',explanation:'Internal interaction forces are equal and opposite and cancel in the system momentum balance. External impulse can change total momentum.'},
  {type:'numeric',topic:'Conservation',prompt:'A 2 kg cart at +4 m/s collides with a 2 kg cart at rest. They stick. Find their common final velocity.',answer:2,tolerance:0.02,unit:'m/s',explanation:'vf = (2×4 + 2×0)/(2+2) = 2 m/s in the positive direction.'},
  {type:'choice',topic:'Conservation',prompt:'A 1 kg cart at +6 m/s hits a 2 kg stationary cart and they stick. What is their common velocity?',choices:['+2 m/s','+3 m/s','−2 m/s','+6 m/s'],answer:'+2 m/s',explanation:'Momentum gives (1×6 + 2×0)/(1+2) = +2 m/s.'},
  {type:'choice',topic:'Conservation',prompt:'Two skaters push apart from rest on nearly frictionless ice. What is their total momentum after they separate?',choices:['Zero','Positive for both','Negative for both','Equal to their total kinetic energy'],answer:'Zero',explanation:'Initial total momentum is zero and external horizontal impulse is negligible, so their opposite momenta sum to zero.'},
  {type:'choice',topic:'Conservation',prompt:'Momentum is conserved in an isolated collision. Must kinetic energy also be conserved?',choices:['No, only in an ideal elastic collision','Yes, in every collision','Only if the objects stick','No, never'],answer:'No, only in an ideal elastic collision',explanation:'Momentum is conserved for an isolated system. Kinetic energy is conserved only for an elastic collision.'},
  {type:'numeric',topic:'Conservation',prompt:'A 3 kg object at +4 m/s and a 1 kg object at −8 m/s move together after collision. Find their common velocity.',answer:1,tolerance:0.02,unit:'m/s',explanation:'Total p = 3×4 + 1×(−8) = 4 kg m/s. Total mass is 4 kg, so vf = +1 m/s.'},
  {type:'choice',topic:'Conservation',prompt:'A 0.5 kg ball at +8 m/s hits a 0.5 kg ball at −2 m/s and sticks. What is their final velocity?',choices:['+3 m/s','+5 m/s','−3 m/s','+6 m/s'],answer:'+3 m/s',explanation:'Total momentum = 0.5×8 + 0.5×(−2) = 3 kg m/s. Total mass = 1.0 kg, so vf = +3 m/s.'},
  {type:'choice',topic:'Conservation',prompt:'An isolated system has initial total momentum −12 kg m/s. What is final total momentum?',choices:['−12 kg m/s','+12 kg m/s','0 kg m/s','It depends on kinetic energy'],answer:'−12 kg m/s',explanation:'The signed total momentum remains −12 kg m/s if the net external impulse is zero.'},
  {type:'choice',topic:'Conservation',prompt:'What is the most important first step in a one-dimensional momentum problem?',choices:['Choose a positive direction and use signed velocities consistently','Ignore direction','Convert all masses to newtons','Assume objects stick'],answer:'Choose a positive direction and use signed velocities consistently',explanation:'Momentum is a vector, so signs encode direction in one dimension.'},
  {type:'choice',topic:'Collisions',prompt:'What defines a perfectly inelastic collision?',choices:['The colliding objects stick together','Kinetic energy is conserved','Both objects stop','Momentum is not conserved'],answer:'The colliding objects stick together',explanation:'In a perfectly inelastic collision, the objects share a common final velocity. Momentum is conserved in an isolated system, while kinetic energy is generally not.'},
  {type:'choice',topic:'Collisions',prompt:'In a perfectly elastic one-dimensional collision, which quantities are conserved for an isolated system?',choices:['Momentum and kinetic energy','Only momentum','Only kinetic energy','Neither'],answer:'Momentum and kinetic energy',explanation:'An ideal perfectly elastic collision conserves both total momentum and total kinetic energy.'},
  {type:'choice',topic:'Collisions',prompt:'A 2 kg cart moving at +5 m/s collides elastically with an identical stationary cart. What are the final velocities?',choices:['First 0 m/s, second +5 m/s','Both +2.5 m/s','First +5 m/s, second 0 m/s','Both stop'],answer:'First 0 m/s, second +5 m/s',explanation:'For equal masses in a one-dimensional perfectly elastic collision, the velocities exchange.'},
  {type:'choice',topic:'Collisions',prompt:'What does coefficient of restitution e = 0 describe?',choices:['A perfectly inelastic collision with zero relative separation speed','A perfectly elastic collision','No momentum transfer is possible','A collision with zero initial momentum'],answer:'A perfectly inelastic collision with zero relative separation speed',explanation:'For e = 0, relative speed of separation is zero, so the objects have the same final velocity.'},
  {type:'choice',topic:'Collisions',prompt:'A coefficient of restitution e = 1 means…',choices:['Relative speed of separation equals relative speed of approach','The objects must stick','All momentum is lost','The collision has no impulse'],answer:'Relative speed of separation equals relative speed of approach',explanation:'This is the ideal perfectly elastic condition. For an isolated collision it also corresponds to kinetic-energy conservation.'},
  {type:'numeric',topic:'Collisions',prompt:'A 1 kg object moving at +6 m/s strikes an equal 1 kg object at rest elastically. Find the first object’s final velocity.',answer:0,tolerance:0.02,unit:'m/s',explanation:'Equal masses exchange velocities in a one-dimensional perfectly elastic collision, so the first object ends at 0 m/s.'},
  {type:'choice',topic:'Collisions',prompt:'A 2 kg object at +3 m/s and a 1 kg object at −2 m/s stick together. What is the common final velocity?',choices:['+1.33 m/s','+2.0 m/s','−1.33 m/s','+4.0 m/s'],answer:'+1.33 m/s',explanation:'Total momentum = 6 − 2 = 4 kg m/s, total mass = 3 kg, so vf = 4/3 ≈ +1.33 m/s.'},
  {type:'choice',topic:'Collisions',prompt:'Two objects explode apart from rest due only to internal forces. Which statement is correct?',choices:['Their momenta are equal in magnitude and opposite in direction','They have equal speeds in all cases','Each object gains the same momentum direction','Total momentum increases'],answer:'Their momenta are equal in magnitude and opposite in direction',explanation:'Initial system momentum is zero. Momentum conservation requires mA vA + mB vB = 0, so momenta are opposite and equal in magnitude.'},
  {type:'choice',topic:'Collisions',prompt:'Why is momentum conserved during a collision lasting a very short time even if gravity acts?',choices:['External gravitational impulse is often negligible compared with collision impulse','Gravity is not a force during collisions','Kinetic energy cancels gravity','Mass becomes zero'],answer:'External gravitational impulse is often negligible compared with collision impulse',explanation:'For a selected system, momentum is approximately conserved when the net external impulse during the short collision is negligible.'},
  {type:'choice',topic:'Collisions',prompt:'A moving object can move in the opposite direction after a collision because…',choices:['Its final momentum can have the opposite sign after a sufficiently large impulse','Momentum has no direction','Energy conservation forces reversal','Its mass changes sign'],answer:'Its final momentum can have the opposite sign after a sufficiently large impulse',explanation:'The collision impulse may change momentum through zero and reverse its sign.'},
];

export interface MomentumFlashcard {
  front: string;
  back: string;
}

export const momentumFlashcards: MomentumFlashcard[] = [
  {front:'Define linear momentum.',back:'Linear momentum is mass multiplied by velocity: p = mv.'},
  {front:'Is momentum scalar or vector?',back:'Vector. Momentum points in the direction of velocity.'},
  {front:'What is the SI unit of momentum?',back:'kg m/s, equivalent to N s.'},
  {front:'What is the momentum of a stationary object?',back:'Zero, because p = mv and v = 0.'},
  {front:'How do you represent leftward momentum in a 1D system?',back:'Choose a positive direction, then assign leftward velocity and momentum a negative sign if right is positive.'},
  {front:'Define impulse.',back:'Impulse is the change in momentum caused by a net force over a time interval.'},
  {front:'Impulse equation for constant net force?',back:'J = Fnet Δt.'},
  {front:'State the impulse momentum theorem.',back:'Jnet = Δp = pf − pi.'},
  {front:'What is the SI unit of impulse?',back:'N s, equivalent to kg m/s.'},
  {front:'How is average net force related to impulse?',back:'Favg = Jnet / Δt = Δp / Δt for the interval.'},
  {front:'How does longer stopping time affect average force for the same Δp?',back:'It lowers average force because Favg = Δp/Δt.'},
  {front:'What does signed area under a force-time graph give?',back:'Net impulse, equal to the change in momentum.'},
  {front:'What does a rectangular force-time graph area equal?',back:'The constant force multiplied by the duration, J = FΔt.'},
  {front:'How do you find a triangular force-time area?',back:'J = ½ × base time × height force.'},
  {front:'When is system momentum conserved?',back:'When the net external impulse on the system is zero or negligible.'},
  {front:'Do internal collision forces alter total system momentum?',back:'They redistribute momentum between objects, but internal action-reaction impulses cancel in the system total.'},
  {front:'What must be true about an isolated collision’s total momentum?',back:'Signed total momentum before equals signed total momentum after.'},
  {front:'What is a perfectly elastic collision?',back:'An ideal collision conserving both total momentum and total kinetic energy.'},
  {front:'What is a perfectly inelastic collision?',back:'A collision in which objects stick together and share a common final velocity.'},
  {front:'Is kinetic energy conserved in every collision?',back:'No. It is conserved in an ideal elastic collision, but usually not in inelastic collisions.'},
  {front:'Common velocity after two objects stick?',back:'vf = (m1u1 + m2u2)/(m1 + m2), with signed initial velocities.'},
  {front:'Coefficient of restitution equation in 1D?',back:'e = relative speed of separation / relative speed of approach, for an approaching pair.'},
  {front:'What does e = 1 mean?',back:'Perfectly elastic relative motion: separation speed equals approach speed.'},
  {front:'What does e = 0 mean?',back:'Zero relative separation speed; in a direct collision the objects move together after impact.'},
  {front:'What is the momentum result when two skaters push apart from rest?',back:'Their momenta are equal in magnitude and opposite in direction, so total momentum remains zero if external impulse is negligible.'},
  {front:'Why do airbags reduce injury risk?',back:'They increase stopping time and spread contact forces, reducing average force for a similar momentum change.'},
  {front:'Why bend knees when landing?',back:'Increasing stopping time reduces average force for approximately the same change in momentum.'},
  {front:'How does a rocket gain forward momentum?',back:'It expels exhaust backward. The rocket and exhaust exchange momentum; the system’s total momentum is conserved when external impulse is negligible.'},
  {front:'What is recoil?',back:'The motion of an object in response to an opposite momentum change in an interacting system.'},
  {front:'A misconception: greater mass always means greater momentum.',back:'Not necessarily. Momentum depends on both mass and velocity; compare mv with signed velocity.'},
];
